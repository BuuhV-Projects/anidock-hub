import { BrowserWindow, shell, app } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import config from './config';

export class WindowManager {
  private mainWindow: BrowserWindow | undefined;

  createMainWindow(): BrowserWindow {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      return this.mainWindow;
    }

    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      autoHideMenuBar: config.getBoolEnv('ELECTRON_AUTO_HIDE_MENU_BAR', false),
      fullscreen: true,
      ...(process.platform === 'linux' ? { icon: join(__dirname, '../../resources/icon.png') } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.cjs'),
        sandbox: config.getBoolEnv('ELECTRON_SANDBOX', false),
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    mainWindow.on('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      this.mainWindow = undefined;
    });

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    this.mainWindow = mainWindow;
    this.loadRenderer(mainWindow);

    return mainWindow;
  }

  closeMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close();
    }
  }

  getMainWindow(): BrowserWindow | undefined {
    return this.mainWindow;
  }

  private loadRenderer(window: BrowserWindow): void {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      window.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else if (is.dev) {
      // In development without renderer URL, load from dist-electron
      window.loadFile(join(__dirname, '../renderer/index.html'));
    } else {
      // In production, the renderer is in out/renderer/
      window.loadFile(join(app.getAppPath(), 'out/renderer/index.html'));
    }
  }
}


