import { create } from 'zustand';

interface LogEntry {
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface DebugLogsState {
  logs: LogEntry[];
  addLog: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
  clearLogs: () => void;
}

export const useDebugLogsStore = create<DebugLogsState>((set) => ({
  logs: [],
  addLog: (message, type = 'info') => set((state) => ({
    logs: [...state.logs, { timestamp: Date.now(), message, type }]
  })),
  clearLogs: () => set({ logs: [] })
}));