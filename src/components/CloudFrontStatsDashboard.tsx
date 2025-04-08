import React, { useState, useMemo } from 'react';
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
import { CloudFrontStatsEntry } from '../types';
import { ArrowUpDown } from 'lucide-react';

interface CloudFrontStatsDashboardProps {
  data: CloudFrontStatsEntry[];
}

type SortField = keyof CloudFrontStatsEntry;
type SortDirection = 'asc' | 'desc';

export function CloudFrontStatsDashboard({ data }: CloudFrontStatsDashboardProps) {
  const [sortField, setSortField] = useState<SortField>('TimeBucket');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Transform data into a format suitable for Recharts
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data
      .map(entry => ({
        time: new Date(entry.TimeBucket).toLocaleString(),
        timestamp: new Date(entry.TimeBucket).getTime(),
        Requests: entry.RequestCount || 0,
        BytesDownloaded: entry.TotalBytes || 0,
        TotalErrorRate: entry.RequestCount > 0 ? (entry.ErrorCount / entry.RequestCount) * 100 : 0,
        '4xxErrorRate': entry.RequestCount > 0 ? (entry.Http4xx / entry.RequestCount) * 100 : 0,
        '5xxErrorRate': entry.RequestCount > 0 ? (entry.Http5xx / entry.RequestCount) * 100 : 0
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  const formatValue = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'TimeBucket') {
        comparison = new Date(a.TimeBucket).getTime() - new Date(b.TimeBucket).getTime();
      } else if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        comparison = (a[sortField] as string).localeCompare(b[sortField] as string);
      } else {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  const SortableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <th 
      onClick={() => handleSort(field)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <ArrowUpDown className={`w-4 h-4 transition-colors ${
          sortField === field ? 'text-blue-500' : 'text-gray-400'
        }`} />
      </div>
    </th>
  );

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-full p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">CloudFront Statistics</h2>
        <div className="h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              {/* Primary Y-axis for Requests */}
              <YAxis
                yAxisId="requests"
                label={{
                  value: 'Requests',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#8884d8'
                }}
                tickFormatter={formatValue}
                stroke="#8884d8"
              />
              {/* Secondary Y-axis for Bytes */}
              <YAxis
                yAxisId="bytes"
                orientation="right"
                label={{
                  value: 'Bytes',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#82ca9d'
                }}
                tickFormatter={formatValue}
                stroke="#82ca9d"
              />
              {/* Third Y-axis for Error Rates */}
              <YAxis
                yAxisId="errors"
                orientation="right"
                label={{
                  value: 'Error Rate (%)',
                  angle: 90,
                  position: 'insideRight',
                  fill: '#ff7300'
                }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                stroke="#ff7300"
                offset={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'Requests') return [formatValue(value), 'Requests'];
                  if (name === 'BytesDownloaded') return [formatValue(value), 'Bytes'];
                  return [`${value.toFixed(2)}%`, name];
                }}
              />
              <Legend />
              <Line
                yAxisId="requests"
                type="monotone"
                dataKey="Requests"
                stroke="#8884d8"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="bytes"
                type="monotone"
                dataKey="BytesDownloaded"
                stroke="#82ca9d"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="errors"
                type="monotone"
                dataKey="TotalErrorRate"
                stroke="#ff7300"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="errors"
                type="monotone"
                dataKey="4xxErrorRate"
                stroke="#ff0000"
                dot={false}
                strokeWidth={2}
              />
              <Line
                yAxisId="errors"
                type="monotone"
                dataKey="5xxErrorRate"
                stroke="#ffc658"
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

      {/* Detailed Metrics Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Detailed Metrics</h2>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <SortableHeader field="TimeBucket" label="Time" />
              <SortableHeader field="RequestCount" label="Requests" />
              <SortableHeader field="HitCount" label="Hits" />
              <SortableHeader field="MissCount" label="Misses" />
              <SortableHeader field="ErrorCount" label="Errors" />
              <SortableHeader field="Http2xx" label="2xx" />
              <SortableHeader field="Http3xx" label="3xx" />
              <SortableHeader field="Http4xx" label="4xx" />
              <SortableHeader field="Http5xx" label="5xx" />
              <SortableHeader field="TotalBytes" label="Total Bytes" />
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(entry.TimeBucket).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.RequestCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.HitCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.MissCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.ErrorCount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.Http2xx)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.Http3xx)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.Http4xx)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.Http5xx)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatValue(entry.TotalBytes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}