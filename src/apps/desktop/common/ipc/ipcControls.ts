import { App, ipcMain } from 'electron';
import { WindowManager } from '../../main/windowManager';
import { IPC_CHANNELS } from './channels';

export const registerWindowControls = (windowManager: WindowManager): void => {
  ipcMain.on(IPC_CHANNELS.window.close, () => {
    windowManager.closeMainWindow();
  });
};
export const registerAppControls = (app: App): void => {
  // Register IPC handler for app version
  ipcMain.handle(IPC_CHANNELS.app.version, () => {
    return app.getVersion();
  });
};