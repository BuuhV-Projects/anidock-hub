import { WindowManager } from '../windowManager';
import { registerWindowControls } from './windowControls';

export const registerIpcHandlers = (windowManager: WindowManager): void => {
  registerWindowControls(windowManager);
};


