import { create } from 'zustand';
import { DependentFileState } from '../types';

interface FileStateStore {
  dependentFiles: DependentFileState;
  setDependentFile: (
    category: keyof DependentFileState,
    type: string,
    data: any,
    fileName: string
  ) => void;
  clearDependentFiles: (category: keyof DependentFileState) => void;
  getDependentFiles: (category: keyof DependentFileState) => any;
}

export const useFileStateStore = create<FileStateStore>((set, get) => ({
  dependentFiles: {
    awsMetrics: {},
    splunk: {}
  },
  setDependentFile: (category, type, data, fileName) => {
    set((state) => ({
      dependentFiles: {
        ...state.dependentFiles,
        [category]: {
          ...state.dependentFiles[category],
          [type]: {
            data,
            fileName
          }
        }
      }
    }));
  },
  clearDependentFiles: (category) => {
    set((state) => ({
      dependentFiles: {
        ...state.dependentFiles,
        [category]: {}
      }
    }));
  },
  getDependentFiles: (category) => {
    return get().dependentFiles[category];
  }
}));