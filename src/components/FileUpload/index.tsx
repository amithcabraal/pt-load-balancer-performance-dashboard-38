import React, { useState, useRef } from 'react';
import { FileUploadZone } from './FileUploadZone';
import { ProcessingOverlay } from './ProcessingOverlay';
import { LoadedFilesSection } from './LoadedFilesSection';
import { ErrorNotification } from './ErrorNotification';
import { FileProcessor } from './fileProcessor';
import { useDebugLogsStore } from '../../store/debugLogs';

interface FileUploadProps {
  onDataLoaded: any;
  dataState: any;
  onClear: (format?: any) => void;
}

export function FileUpload({ onDataLoaded, dataState, onClear }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatuses, setProcessingStatuses] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<{ message: string; fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const addLog = useDebugLogsStore(state => state.addLog);

  const updateProcessingStatus = (fileName: string, status: string, progress: number = 0) => {
    setProcessingStatuses(prev => {
      const existing = prev.find(s => s.fileName === fileName);
      if (existing) {
        return prev.map(s => s.fileName === fileName ? { ...s, status, progress } : s);
      }
      return [...prev, { fileName, status, progress }];
    });
  };

  const removeProcessingStatus = (fileName: string) => {
    setProcessingStatuses(prev => prev.filter(s => s.fileName !== fileName));
  };

  const showError = (message: string, fileName: string) => {
    setError({ message, fileName });
    setTimeout(() => setError(null), 5000);
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (files.length === 0) {
      showError('No files selected', 'File Selection');
      return;
    }

    setIsProcessing(true);
    setProcessingStatuses([]);

    const fileProcessor = new FileProcessor(
      onDataLoaded,
      updateProcessingStatus,
      removeProcessingStatus,
      showError,
      addLog
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size === 0) {
        showError('File is empty', file.name);
        continue;
      }

      addLog(`📁 Processing file: ${file.name}`, 'info');
      updateProcessingStatus(file.name, 'Starting...', 0);

      if (file.name.endsWith('.zip')) {
        try {
          const JSZip = (await import('jszip')).default;
          const zip = new JSZip();
          addLog(`📦 Extracting ZIP file: ${file.name}`, 'info');
          updateProcessingStatus(file.name, 'Extracting ZIP...', 20);
          const zipContent = await zip.loadAsync(file);
          
          const allFiles = Object.entries(zipContent.files).filter(([name]) => 
            name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.json')
          );

          if (allFiles.length === 0) {
            showError('ZIP file contains no supported files', file.name);
            removeProcessingStatus(file.name);
            continue;
          }

          addLog(`📦 Found ${allFiles.length} files in ZIP`, 'info');

          for (const [fileName, zipEntry] of allFiles) {
            if (!zipEntry.dir) {
              updateProcessingStatus(fileName, 'Extracting file...', 50);
              const content = await zipEntry.async('string');
              if (!content.trim()) {
                showError('File is empty', fileName);
                continue;
              }
              updateProcessingStatus(fileName, 'Processing...', 75);
              await fileProcessor.processContent(content, fileName);
              removeProcessingStatus(fileName);
            }
          }
          removeProcessingStatus(file.name);
        } catch (error) {
          addLog(`❌ Error processing ZIP file: ${error}`, 'error');
          showError('Failed to process ZIP file', file.name);
          removeProcessingStatus(file.name);
        }
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        try {
          updateProcessingStatus(file.name, 'Reading file...', 25);
          const content = await file.text();
          if (!content.trim()) {
            showError('File is empty', file.name);
            removeProcessingStatus(file.name);
            continue;
          }
          updateProcessingStatus(file.name, 'Processing...', 75);
          await fileProcessor.processContent(content, file.name);
          removeProcessingStatus(file.name);
        } catch (error) {
          addLog(`❌ Error processing file ${file.name}: ${error}`, 'error');
          showError('Failed to process file', file.name);
          removeProcessingStatus(file.name);
        }
      } else {
        showError('Unsupported file type', file.name);
      }
    }

    addLog('✅ File processing complete', 'success');
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {dataState.loadBalancerData || dataState.performanceData || 
       dataState.slowQueriesData || dataState.errorSummaryData ||
       dataState.loadRunnerData || dataState.cfStatsData ||
       dataState.cfObjectsData || dataState.patternsData ||
       dataState.awsMetricsData ? (
        <div className="flex gap-4">
          <div className="w-1/2">
            <LoadedFilesSection dataState={dataState} onClear={onClear} />
          </div>
          <div className="w-1/2">
            <FileUploadZone
              ref={fileInputRef}
              dropZoneRef={dropZoneRef}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onDrop={handleFiles}
              onFileSelect={(e) => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        </div>
      ) : (
        <FileUploadZone
          ref={fileInputRef}
          dropZoneRef={dropZoneRef}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          onDrop={handleFiles}
          onFileSelect={(e) => e.target.files && handleFiles(e.target.files)}
          isFullWidth
        />
      )}

      <ProcessingOverlay
        isProcessing={isProcessing}
        processingStatuses={processingStatuses}
      />

      {error && (
        <ErrorNotification
          message={error.message}
          fileName={error.fileName}
          onDismiss={() => setError(null)}
        />
      )}
    </div>
  );
}