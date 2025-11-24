import { ipcMain } from 'electron';
import { WindowManager } from '../windowManager';
import { IPC_CHANNELS } from '../../common/ipc/channels';

export const registerWindowControls = (windowManager: WindowManager): void => {
  ipcMain.on(IPC_CHANNELS.window.close, () => {
    windowManager.closeMainWindow();
  });
};


