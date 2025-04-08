import React, { useMemo, useState } from 'react';
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
import { AWSMetricsData, AWSMetricResult, AWSMetricQuery } from '../types';
import { Activity, Info, X } from 'lucide-react';

interface AWSMetricsDashboardProps {
  data: AWSMetricsData;
}

interface MetricInfoModalProps {
  query?: AWSMetricQuery;
  onClose: () => void;
}

interface ChartModalProps {
  data: any[];
  label: string;
  onClose: () => void;
}

function ChartModal({ data, label, onClose }: ChartModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{label}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey={label}
                stroke="#8884d8"
                dot={false}
                strokeWidth={2}
              />
              <Brush 
                dataKey="time"
                height={30}
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricInfoModal({ query, onClose }: MetricInfoModalProps) {
  if (!query) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Metric Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Metric Name</h4>
            <p className="text-sm text-gray-900 dark:text-white">{query.MetricStat.Metric.MetricName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Namespace</h4>
            <p className="text-sm text-gray-900 dark:text-white">{query.MetricStat.Metric.Namespace}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Period</h4>
            <p className="text-sm text-gray-900 dark:text-white">{query.MetricStat.Period} seconds</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Statistic</h4>
            <p className="text-sm text-gray-900 dark:text-white">{query.MetricStat.Stat}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dimensions</h4>
            <div className="space-y-1 mt-1">
              {query.MetricStat.Metric.Dimensions.map((dim, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-600 dark:text-gray-400">{dim.Name}:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{dim.Value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#0088FE', // Blue
  '#00C49F', // Teal
];

const formatNumber = (value: number | undefined): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0.00';
  return value.toFixed(2);
};

const extractTargetGroupPrefix = (value: string): string => {
  const parts = value.split('/');
  if (parts.length >= 2) {
    const targetGroup = parts[1];
    const match = targetGroup.match(/^[a-zA-Z]+/);
    return match ? match[0] : targetGroup;
  }
  return value;
};

const extractLoadBalancerName = (value: string): string => {
  const parts = value.split('/');
  if (parts.length >= 2) {
    const lbParts = parts[1].split('-');
    return lbParts.slice(3).join('-');
  }
  return value;
};

const generateSeriesLabel = (query: AWSMetricQuery): string => {
  const metricName = query.MetricStat.Metric.MetricName;
  let targetGroup = '';
  let loadBalancer = '';
  let availability = '';

  query.MetricStat.Metric.Dimensions.forEach(dim => {
    if (dim.Name === 'TargetGroup') {
      targetGroup = extractTargetGroupPrefix(dim.Value);
    } else if (dim.Name === 'LoadBalancer') {
      loadBalancer = extractLoadBalancerName(dim.Value);
    } else if (dim.Name === 'AvailabilityZone') {
      availability = dim.Value.split('-')[2]; // Get the last part of az-region-letter
    }
  });

  return `${metricName} [${targetGroup},${loadBalancer},${availability}]`;
};

export function AWSMetricsDashboard({ data }: AWSMetricsDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<AWSMetricQuery | undefined>();
  const [selectedChart, setSelectedChart] = useState<{ data: any[], label: string } | null>(null);

  // Transform data for combined chart
  const combinedChartData = useMemo(() => {
    if (!data.MetricDataResults?.length) return [];

    // Get all unique timestamps
    const allTimestamps = new Set<string>();
    data.MetricDataResults.forEach(result => {
      result.Timestamps?.forEach(ts => allTimestamps.add(ts));
    });

    // Create a map of timestamp to values
    return Array.from(allTimestamps)
      .sort()
      .map(timestamp => {
        const point: any = {
          time: new Date(timestamp).toLocaleString(),
          timestamp: new Date(timestamp).getTime(),
        };

        data.MetricDataResults.forEach(result => {
          const index = result.Timestamps?.indexOf(timestamp) ?? -1;
          const query = data.Queries?.find(q => q.Id === result.Id);
          if (query) {
            const label = generateSeriesLabel(query);
            point[label] = index !== -1 ? result.Values?.[index] ?? null : null;
          }
        });

        return point;
      });
  }, [data]);

  return (
    <div className="w-full space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AWS ALB Metrics Analysis</h2>
        </div>

        {/* Combined Chart */}
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedChartData}>
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
                  value: 'Request Count', 
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
              />
              <Legend />
              {data.MetricDataResults?.map((result, index) => {
                const query = data.Queries?.find(q => q.Id === result.Id);
                const label = query ? generateSeriesLabel(query) : result.Label;
                return (
                  <Line
                    key={result.Id}
                    type="monotone"
                    dataKey={label}
                    stroke={COLORS[index % COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                  />
                );
              })}
              <Brush 
                dataKey="time"
                height={30}
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Individual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {data.MetricDataResults?.map((result, index) => {
            const query = data.Queries?.find(q => q.Id === result.Id);
            const label = query ? generateSeriesLabel(query) : result.Label;
            return (
              <div 
                key={result.Id} 
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedChart({ data: combinedChartData, label })}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h3>
                  {query && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMetric(query);
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      title="View metric details"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        stroke="#9CA3AF"
                      />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid #ccc',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={label}
                        stroke={COLORS[index % COLORS.length]}
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Modal */}
        {selectedMetric && (
          <MetricInfoModal
            query={selectedMetric}
            onClose={() => setSelectedMetric(undefined)}
          />
        )}

        {/* Chart Modal */}
        {selectedChart && (
          <ChartModal
            data={selectedChart.data}
            label={selectedChart.label}
            onClose={() => setSelectedChart(null)}
          />
        )}
      </div>
    </div>
  );
}