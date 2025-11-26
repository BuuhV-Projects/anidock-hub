import { App, ipcRenderer } from 'electron';
import { WindowManager } from '../../main/windowManager';
import { registerAppControls, registerWindowControls } from './ipcControls';
import { IPC_CHANNELS } from './channels';

export const registerIpcHandlers = (windowManager: WindowManager, app: App): void => {
  registerWindowControls(windowManager);
  registerAppControls(app);
};


export const windowApi = {
  closeWindow: () => {
    ipcRenderer.send(IPC_CHANNELS.window.close);
  },
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.app.version)
};