import React from 'react';
import { X } from 'lucide-react';

interface FileFormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileFormatsModal({ isOpen, onClose }: FileFormatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Supported File Formats</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tab Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Data Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">File Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">File Naming Convention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Required Columns/Format</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LB Summary View</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Load Balancer Data</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">summary-results.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">normalized_url, elb_status_code, request_verb, etc.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LB Stats</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Performance Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">stats-results.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">base_url, request_verb, min_rt, etc.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LB Slow Requests</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Slow Queries</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">slow-results.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">time, processing_time, request_url, etc.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LB Error Summary</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Error Summary</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">TXT</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">errors.summary.txt</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">count "error message" or count {"json_error_object"}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LoadRunner Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LoadRunner Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">report-run.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">clock_time, metric, transaction, etc.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CF Stats</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CloudFront Statistics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CacheStatistics.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Report column with value "CacheStatistics"</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CF Objects</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CloudFront Popular Objects</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CSV</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">PopularObjects.csv</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Report column with value "PopularObjects"</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CF Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">CloudFront Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">JSON</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">cfstats*.json</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">MetricDataResults array</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">LB Patterns</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Log Patterns</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">JSON</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">patterns.json</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">@pattern, @tokens, @severityLabel</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">AWS ALB Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">AWS ALB Metrics</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">JSON</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">aws-metrics*query.json and aws-metrics*results.json</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Two files required: query definition and results</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Splunk APM</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Splunk APM</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">JSON</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">splunk-workflows.json and splunk-metrics.json</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">Two files required: workflows and metrics</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}