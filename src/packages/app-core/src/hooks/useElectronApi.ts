import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron?: ElectronAPI;
    api?: {
      closeWindow: () => void;
    };
  }
}

export const useElectronApi = () => {
  if (!window.electron) {
    throw new Error('Electron API is not available in this environment');
  }
  if (!window.api) {
    throw new Error('Electron API is not available in this environment');
  }

  return {
    closeWindow: window.api.closeWindow
  };
};