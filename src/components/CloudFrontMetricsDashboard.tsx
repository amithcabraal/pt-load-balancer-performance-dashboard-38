import React, { useMemo } from 'react';
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
import { CloudFrontMetricsData } from '../types';
import { Activity } from 'lucide-react';

interface CloudFrontMetricsDashboardProps {
  data: CloudFrontMetricsData;
}

const COLORS = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#0088FE', // Blue
  '#00C49F', // Teal
];

const formatNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(1);
};

export function CloudFrontMetricsDashboard({ data }: CloudFrontMetricsDashboardProps) {
  const chartData = useMemo(() => {
    const allTimestamps = new Set<string>();
    data.MetricDataResults.forEach(result => {
      result.Timestamps.forEach(ts => allTimestamps.add(ts));
    });

    return Array.from(allTimestamps)
      .sort()
      .map(timestamp => {
        const point: any = {
          time: new Date(timestamp).toLocaleString(),
          timestamp: new Date(timestamp).getTime(),
        };

        data.MetricDataResults.forEach(result => {
          const index = result.Timestamps.indexOf(timestamp);
          point[result.Label] = index !== -1 ? result.Values[index] : null;
        });

        return point;
      });
  }, [data]);

  // Calculate statistics for each metric
  const metricStats = useMemo(() => {
    return data.MetricDataResults.map(result => {
      const values = result.Values.filter(v => !isNaN(v));
      
      if (values.length === 0) {
        return {
          label: result.Label,
          min: '0.00',
          max: '0.00',
          avg: '0.00',
          current: '0.00',
          total: '0.00'
        };
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const current = values[values.length - 1];

      return {
        label: result.Label,
        min: formatNumber(min),
        max: formatNumber(max),
        avg: formatNumber(avg),
        current: formatNumber(current),
        total: formatNumber(sum)
      };
    });
  }, [data]);

  return (
    <div className="w-full space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">CloudFront Metrics Analysis</h2>
        </div>

        {/* Combined Chart */}
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
                yAxisId="requests"
                label={{ 
                  value: 'Requests', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#8884d8'
                }}
                stroke="#8884d8"
              />
              <YAxis 
                yAxisId="bytes"
                orientation="right"
                label={{ 
                  value: 'Bytes', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: '#82ca9d'
                }}
                stroke="#82ca9d"
              />
              <YAxis 
                yAxisId="errors"
                orientation="right"
                label={{ 
                  value: 'Error Rate', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: '#ff7300'
                }}
                stroke="#ff7300"
                offset={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [formatNumber(value), '']}
              />
              <Legend />
              {data.MetricDataResults.map((result, index) => {
                const yAxisId = result.Label.includes('Error') ? 'errors' :
                              result.Label.includes('Bytes') ? 'bytes' : 'requests';
                return (
                  <Line
                    key={result.Id}
                    type="monotone"
                    dataKey={result.Label}
                    stroke={COLORS[index % COLORS.length]}
                    yAxisId={yAxisId}
                    dot={false}
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {metricStats.map((stat, index) => {
            const colorIndex = index % COLORS.length;
            const borderColor = COLORS[colorIndex];
            return (
              <div 
                key={stat.label}
                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                style={{ borderLeft: `4px solid ${borderColor}` }}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{stat.label}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.current}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.avg}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Min</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.min}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Max</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.max}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.total}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {data.MetricDataResults.map((result, index) => (
            <div key={result.Id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{result.Label}</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                    <YAxis 
                      stroke="#9CA3AF"
                      tickFormatter={formatNumber}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [formatNumber(value), result.Label]}
                    />
                    <Line
                      type="monotone"
                      dataKey={result.Label}
                      stroke={COLORS[index % COLORS.length]}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Metrics Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                {data.MetricDataResults.map(result => (
                  <th key={result.Id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {result.Label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {chartData.map((point, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {point.time}
                  </td>
                  {data.MetricDataResults.map(result => (
                    <td key={result.Id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(point[result.Label] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}