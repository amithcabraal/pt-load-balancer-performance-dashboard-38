import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorNotificationProps {
  message: string;
  fileName: string;
  onDismiss: () => void;
}

export function ErrorNotification({ message, fileName, onDismiss }: ErrorNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Error Processing File
          </h3>
          <div className="mt-1">
            <p className="text-sm text-red-700 dark:text-red-300">
              {message}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              File: {fileName}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}