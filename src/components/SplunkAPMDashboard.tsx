import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { SplunkWorkflow, SplunkMetric } from '../types';
import { Activity, AlertCircle, Search, ExternalLink } from 'lucide-react';

interface SplunkAPMDashboardProps {
  workflows: SplunkWorkflow[];
  metrics: Record<string, SplunkMetric[]>;
}

interface WorkflowInfo {
  name: string;
  hasError: boolean;
  metrics: Set<string>;
  ids: Set<string>;
  hasData: boolean;
}

const METRIC_COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Gold
  '#FF8042', // Coral
];

export function SplunkAPMDashboard({ workflows, metrics }: SplunkAPMDashboardProps) {
  const [excludeHealthChecks, setExcludeHealthChecks] = useState(true);
  const [workflowFilter, setWorkflowFilter] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  
  // Create a mapping of workflow names to their info
  const workflowMap = useMemo(() => {
    const map = new Map<string, WorkflowInfo>();
    
    workflows.forEach(workflow => {
      const existingEntry = map.get(workflow.sf_workflow) || {
        name: workflow.sf_workflow,
        hasError: false,
        metrics: new Set<string>(),
        ids: new Set<string>(),
        hasData: false
      };

      existingEntry.hasError = existingEntry.hasError || workflow.sf_error === 'true';
      existingEntry.metrics.add(workflow.sf_metric);
      existingEntry.ids.add(workflow.sf_id);
      
      // Check if this workflow has any metric data
      existingEntry.hasData = Array.from(existingEntry.ids).some(id => {
        const metricData = metrics[id];
        return metricData && metricData.length > 0;
      });
      
      map.set(workflow.sf_workflow, existingEntry);
    });

    return map;
  }, [workflows, metrics]);

  // Get unique workflow names, sorted by data availability and name
  const workflowNames = useMemo(() => {
    return Array.from(workflowMap.entries())
      .filter(([name]) => !excludeHealthChecks || !name.includes('/actuator/health'))
      .sort((a, b) => {
        // First sort by data availability (workflows with data first)
        if (a[1].hasData !== b[1].hasData) {
          return a[1].hasData ? -1 : 1;
        }
        // Then sort alphabetically
        return a[0].localeCompare(b[0]);
      })
      .map(([name]) => name);
  }, [workflowMap, excludeHealthChecks]);

  const filteredWorkflowNames = useMemo(() => {
    return workflowNames.filter(name => 
      name.toLowerCase().includes(workflowFilter.toLowerCase())
    );
  }, [workflowNames, workflowFilter]);

  // Set initial workflow if not set and workflows exist
  React.useEffect(() => {
    if ((!selectedWorkflow || (excludeHealthChecks && selectedWorkflow.includes('/actuator/health'))) && workflowNames.length > 0) {
      // Find first workflow with data
      const firstWorkflowWithData = workflowNames.find(name => workflowMap.get(name)?.hasData);
      setSelectedWorkflow(firstWorkflowWithData || workflowNames[0]);
    }
  }, [selectedWorkflow, workflowNames, excludeHealthChecks, workflowMap]);

  const chartData = useMemo(() => {
    if (!selectedWorkflow) return [];

    const workflowInfo = workflowMap.get(selectedWorkflow);
    if (!workflowInfo) return [];

    // Get all unique timestamps
    const timestamps = new Set<number>();
    const metricValues: Record<string, Record<number, number>> = {};

    // Initialize metric value storage
    workflowInfo.metrics.forEach(metric => {
      metricValues[metric] = {};
    });

    // Collect all metric values by timestamp
    workflowInfo.ids.forEach(id => {
      const metricData = metrics[id] || [];
      const workflow = workflows.find(w => w.sf_id === id);
      if (!workflow) return;

      metricData.forEach(metricPoint => {
        if (Array.isArray(metricPoint) && metricPoint.length === 2) {
          const timestamp = metricPoint[0];
          const value = metricPoint[1];
          
          if (typeof timestamp === 'number' && !isNaN(timestamp) && 
              typeof value === 'number' && !isNaN(value)) {
            timestamps.add(timestamp);
            metricValues[workflow.sf_metric][timestamp] = value / 1000000; // Convert to ms
          }
        }
      });
    });

    // Create combined data points
    return Array.from(timestamps)
      .sort((a, b) => a - b)
      .map(timestamp => {
        let timeString;
        try {
          timeString = new Date(timestamp).toLocaleString();
        } catch (e) {
          timeString = `Invalid (${timestamp})`;
        }
        
        const point: any = {
          time: timeString,
          timestamp,
        };
        workflowInfo.metrics.forEach(metric => {
          point[metric] = metricValues[metric][timestamp] || null;
        });
        return point;
      });
  }, [selectedWorkflow, workflowMap, metrics, workflows]);

  // Get time range for Splunk link
  const timeRange = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const startTime = chartData[0].timestamp;
    const endTime = chartData[chartData.length - 1].timestamp;
    
    return {
      startTime,
      endTime
    };
  }, [chartData]);

  const splunkUrl = useMemo(() => {
    if (!timeRange) return null;

    return `https://allwyn.signalfx.com/#/apm/troubleshooting?endTimeUTC=${timeRange.endTime}&filters=%7B%22traceFilter%22:%7B%22tags%22:%5B%7B%22tag%22:%22sf_environment%22,%22operation%22:%22IN%22,%22values%22:%5B%22test01%22%5D%7D%5D%7D,%22spanFilters%22:%5B%5D%7D&startTimeUTC=${timeRange.startTime}`;
  }, [timeRange]);

  const getStatistics = useMemo(() => {
    if (chartData.length === 0) return {};

    const workflowInfo = workflowMap.get(selectedWorkflow);
    if (!workflowInfo) return {};

    const stats: Record<string, { min: number, max: number, avg: number, p90: number, p95: number }> = {};

    workflowInfo.metrics.forEach(metric => {
      const values = chartData
        .map(d => d[metric])
        .filter((v): v is number => v !== null)
        .sort((a, b) => a - b);

      if (values.length === 0) {
        stats[metric] = { min: 0, max: 0, avg: 0, p90: 0, p95: 0 };
        return;
      }

      stats[metric] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p90: values[Math.floor(values.length * 0.9)],
        p95: values[Math.floor(values.length * 0.95)]
      };
    });

    return stats;
  }, [chartData, workflowMap, selectedWorkflow]);

  if (workflowNames.length === 0) {
    return (
      <div className="w-full space-y-8 p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 text-amber-500">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">No Metrics Data Available</h2>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {excludeHealthChecks && workflowMap.size > 0 
              ? `Only health check endpoints are available. Try unchecking "Exclude Health Checks" to view them.`
              : `No metrics data has been loaded. Please ensure you have uploaded the correct Splunk APM data files.`}
          </p>
        </div>
      </div>
    );
  }

  const selectedWorkflowInfo = workflowMap.get(selectedWorkflow);

  return (
    <div className="w-full space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
        {/* Header and Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Splunk APM Analysis</h2>
              </div>
              {selectedWorkflowInfo && (
                <div className="ml-9">
                  <h3 className={`text-lg ${
                    selectedWorkflowInfo.hasError ? 'text-red-500 dark:text-red-400' :
                    !selectedWorkflowInfo.hasData ? 'text-gray-400 dark:text-gray-500' :
                    'text-gray-600 dark:text-gray-300'
                  }`}>
                    {selectedWorkflow}
                    {selectedWorkflowInfo.hasError && ' [ERROR]'}
                    {!selectedWorkflowInfo.hasData && ' (no data)'}
                  </h3>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-4">
              {splunkUrl && (
                <a
                  href={splunkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View in Splunk
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={excludeHealthChecks}
                    onChange={(e) => setExcludeHealthChecks(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  Exclude Health Checks
                </label>
                <div className="w-96 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Workflow ({filteredWorkflowNames.length} of {workflowMap.size} available)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={workflowFilter}
                      onChange={(e) => setWorkflowFilter(e.target.value)}
                      placeholder="Search workflows..."
                      className="w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <Search className="w-4 h-4 absolute right-2 top-3 text-gray-400" />
                  </div>
                  {workflowFilter && filteredWorkflowNames.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredWorkflowNames.map(name => {
                        const info = workflowMap.get(name);
                        if (!info) return null;
                        const metricCount = info.metrics.size;
                        const errorSuffix = info.hasError ? ' [ERROR]' : '';
                        const noDataSuffix = !info.hasData ? ' (no data)' : '';
                        
                        return (
                          <button
                            key={name}
                            onClick={() => {
                              setSelectedWorkflow(name);
                              setWorkflowFilter('');
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                              info.hasError ? 'text-red-500 dark:text-red-400' :
                              !info.hasData ? 'text-gray-400 dark:text-gray-500' :
                              'text-gray-900 dark:text-white'
                            }`}
                          >
                            {name}{errorSuffix}{noDataSuffix} ({metricCount} metric{metricCount !== 1 ? 's' : ''})
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Series Chart */}
        {chartData.length > 0 ? (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  label={{ 
                    value: 'Response Time (ms)', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: '#9CA3AF'
                  }}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value?.toFixed(2) || 'N/A'} ms`, 'Response Time']}
                />
                <Legend />
                {Array.from(workflowMap.get(selectedWorkflow)?.metrics || []).map((metric, index) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    name={metric}
                    stroke={METRIC_COLORS[index % METRIC_COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    connectNulls
                  />
                ))}
                <Brush 
                  dataKey="time"
                  height={30}
                  stroke="#8884d8"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" />
              <p>No metrics data available for the selected workflow</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="space-y-4">
          {Object.entries(getStatistics).map(([metric, stats]) => (
            <div key={metric} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{metric}</h3>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">{key}</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {value.toFixed(2)} ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}