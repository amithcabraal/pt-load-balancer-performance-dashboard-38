import { Loader2 } from 'lucide-react';

interface ProcessingStatus {
  fileName: string;
  status: string;
  progress: number;
}

interface ProcessingOverlayProps {
  isProcessing: boolean;
  processingStatuses: ProcessingStatus[];
}

export function ProcessingOverlay({ isProcessing, processingStatuses }: ProcessingOverlayProps) {
  if (!isProcessing || processingStatuses.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-lg font-medium text-gray-900 dark:text-white">Processing files...</span>
          </div>
          {processingStatuses.map((status, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{status.fileName}</span>
                <span className="text-gray-500 dark:text-gray-400">{status.status}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}