import React, { forwardRef } from 'react';
import { Upload, FileUp } from 'lucide-react';

interface FileUploadZoneProps {
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  onDrop: (files: FileList) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  isFullWidth?: boolean;
}

export const FileUploadZone = forwardRef<HTMLInputElement, FileUploadZoneProps>(
  ({ isDragging, setIsDragging, onDrop, onFileSelect, dropZoneRef, isFullWidth }, ref) => {
    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === dropZoneRef.current) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      onDrop(e.dataTransfer.files);
    };

    return (
      <div
        ref={dropZoneRef}
        onClick={() => (ref as React.RefObject<HTMLInputElement>).current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center px-4 py-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer transition-colors
          ${isDragging ? 'border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
          ${isFullWidth ? '' : 'h-full'}`}
      >
        {isDragging ? (
          <>
            <FileUp className={`${isFullWidth ? 'w-16 h-16' : 'w-12 h-12'} text-blue-500 animate-bounce`} />
            <span className={`${isFullWidth ? 'text-xl' : 'text-lg'} font-medium text-blue-600 dark:text-blue-400`}>
              Drop files here
            </span>
          </>
        ) : (
          <>
            <Upload className={`${isFullWidth ? 'w-12 h-12' : 'w-8 h-8'} text-blue-500`} />
            <span className={`${isFullWidth ? 'text-lg' : 'text-base'} font-medium text-gray-700 dark:text-gray-200`}>
              {isFullWidth ? 'Upload Files' : 'Upload Additional Files'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Drag & drop files here or click to browse
            </span>
            {isFullWidth && (
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Load Balancer, Performance Metrics, Slow Requests, LoadRunner Metrics, Splunk APM, AWS ALB Metrics, and Error Summary formats
              </span>
            )}
          </>
        )}
        <input
          ref={ref}
          type="file"
          className="hidden"
          accept=".csv,.txt,.json,.zip"
          multiple
          onChange={onFileSelect}
        />
      </div>
    );
  }
);