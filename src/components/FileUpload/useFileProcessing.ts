import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import Papa from 'papaparse';
import { FileProcessor } from './fileProcessor';

interface ProcessingStatus {
  fileName: string;
  status: string;
  progress: number;
}

interface FileError {
  message: string;
  fileName: string;
}

export function useFileProcessing(onDataLoaded: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatuses, setProcessingStatuses] = useState<ProcessingStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<FileError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProcessingStatus = useCallback((fileName: string, status: string, progress: number = 0) => {
    setProcessingStatuses(prev => {
      const existing = prev.find(s => s.fileName === fileName);
      if (existing) {
        return prev.map(s => s.fileName === fileName ? { ...s, status, progress } : s);
      }
      return [...prev, { fileName, status, progress }];
    });
  }, []);

  const removeProcessingStatus = useCallback((fileName: string) => {
    setProcessingStatuses(prev => prev.filter(s => s.fileName !== fileName));
  }, []);

  const showError = useCallback((message: string, fileName: string) => {
    setError({ message, fileName });
    setTimeout(clearError, 5000); // Auto-dismiss after 5 seconds
  }, [clearError]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (files.length === 0) {
      showError('No files selected', 'File Selection');
      return;
    }

    console.log('🔄 Starting file processing...');
    setIsProcessing(true);
    setProcessingStatuses([]);

    const fileProcessor = new FileProcessor(
      onDataLoaded,
      updateProcessingStatus,
      removeProcessingStatus,
      showError
    );

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size === 0) {
        showError('File is empty', file.name);
        continue;
      }

      console.log(`📁 Processing file: ${file.name}`);
      updateProcessingStatus(file.name, 'Starting...', 0);

      if (file.name.endsWith('.zip')) {
        try {
          console.log(`📦 Extracting ZIP file: ${file.name}`);
          const zip = new JSZip();
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

          console.log(`📦 Found ${allFiles.length} files in ZIP:`, allFiles.map(([name]) => name));

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
          console.error('❌ Error processing ZIP file:', error);
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
          console.error(`❌ Error processing file ${file.name}:`, error);
          showError('Failed to process file', file.name);
          removeProcessingStatus(file.name);
        }
      } else {
        showError('Unsupported file type', file.name);
      }
    }

    console.log('✅ File processing complete');
    setIsProcessing(false);
  }, [onDataLoaded, updateProcessingStatus, removeProcessingStatus, showError]);

  return {
    handleFiles,
    isProcessing,
    processingStatuses,
    isDragging,
    setIsDragging,
    fileInputRef,
    dropZoneRef,
    error,
    clearError
  };
}