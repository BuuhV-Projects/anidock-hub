import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';
import { windowApi } from '../common/ipc';
import { IPC_CHANNELS } from '../common/ipc/channels';

// Crawler API for Puppeteer
const crawlerApi = {
  fetchHTML: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.crawler.fetchHTML, url),
  extractData: (url: string, selectors: any) => ipcRenderer.invoke(IPC_CHANNELS.crawler.extractData, url, selectors),
  extractVideoUrl: (url: string, selectors: any) => ipcRenderer.invoke(IPC_CHANNELS.crawler.extractVideoUrl, url, selectors)
};

// Deep Link API
const deepLinkApi = {
  onImportDriver: (callback: (url: string) => void) => {
    ipcRenderer.on(IPC_CHANNELS.deepLink.importDriver, (_event, url: string) => {
      callback(url);
    });
  },
  removeImportDriverListener: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.deepLink.importDriver);
  }
};

// AI key store API — keys are encrypted in main via safeStorage; the renderer
// only receives the plaintext on explicit get(). Never persist results to
// localStorage from the renderer.
type AiProvider = 'openai' | 'gemini';
const aiKeysApi = {
  save: (provider: AiProvider, plaintextKey: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.aiKeys.save, provider, plaintextKey),
  get: (provider: AiProvider): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.aiKeys.get, provider),
  delete: (provider: AiProvider): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.aiKeys.delete, provider)
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', windowApi);
    contextBridge.exposeInMainWorld('crawler', crawlerApi);
    contextBridge.exposeInMainWorld('deepLink', deepLinkApi);
    contextBridge.exposeInMainWorld('aiKeys', aiKeysApi);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = windowApi;
  window.crawler = crawlerApi;
  window.deepLink = deepLinkApi;
  window.aiKeys = aiKeysApi;
}

