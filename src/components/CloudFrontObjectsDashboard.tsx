import React, { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { CloudFrontObjectEntry } from '../types';

interface CloudFrontObjectsDashboardProps {
  data: CloudFrontObjectEntry[];
}

type SortField = keyof CloudFrontObjectEntry;
type SortDirection = 'asc' | 'desc';

export function CloudFrontObjectsDashboard({ data }: CloudFrontObjectsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('RequestCount');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const getRowBackgroundColor = (hitCountPct: string) => {
    if (hitCountPct === '-' || parseFloat(hitCountPct) < 5) {
      return 'bg-red-50 dark:bg-red-900/20';
    } else if (parseFloat(hitCountPct) > 98) {
      return 'bg-green-50 dark:bg-green-900/20';
    }
    return 'bg-yellow-50 dark:bg-yellow-900/20';
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAndFilteredData = React.useMemo(() => {
    return data
      .filter(entry =>
        entry.Object.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'Object') {
          comparison = a[sortField].localeCompare(b[sortField]);
        } else if (sortField === 'HitCountPct') {
          const aValue = parseFloat(a[sortField]);
          const bValue = parseFloat(b[sortField]);
          comparison = (isNaN(aValue) ? -1 : isNaN(bValue) ? 1 : aValue - bValue);
        } else {
          comparison = (a[sortField] as number) - (b[sortField] as number);
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [data, searchTerm, sortField, sortDirection]);

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

  return (
    <div className="w-full space-y-8 p-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Popular Objects Analysis</h2>
          <div className="relative w-96">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search objects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <SortableHeader field="Object" label="Object Path" />
                <SortableHeader field="RequestCount" label="Requests" />
                <SortableHeader field="HitCount" label="Hits" />
                <SortableHeader field="MissCount" label="Misses" />
                <SortableHeader field="HitCountPct" label="Hit %" />
                <SortableHeader field="BytesFromMisses" label="Bytes (Misses)" />
                <SortableHeader field="TotalBytes" label="Total Bytes" />
                <SortableHeader field="Http2xx" label="2xx" />
                <SortableHeader field="Http3xx" label="3xx" />
                <SortableHeader field="Http4xx" label="4xx" />
                <SortableHeader field="Http5xx" label="5xx" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedAndFilteredData.map((entry, index) => (
                <tr key={index} className={`${getRowBackgroundColor(entry.HitCountPct)} hover:bg-opacity-75`}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{entry.Object}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.RequestCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.HitCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.MissCount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.HitCountPct}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.BytesFromMisses.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.TotalBytes.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.Http2xx.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.Http3xx.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.Http4xx.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.Http5xx.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Cache Status Legend:</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 dark:bg-red-900/20 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Not Cached (Hit Rate &lt; 5%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-900/20 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Partially Cached (5% - 98%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 dark:bg-green-900/20 mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Well Cached (&gt; 98%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}