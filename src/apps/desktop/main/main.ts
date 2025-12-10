import { electronApp, optimizer } from '@electron-toolkit/utils';
import { app, BrowserWindow, globalShortcut, ipcMain } from 'electron';
import { registerIpcHandlers } from '../common/ipc';
import { WindowManager } from './windowManager';
import { IPC_CHANNELS } from '../common/ipc/channels';
import * as puppeteerCrawler from './puppeteerCrawler';

const windowManager = new WindowManager();

// Store pending deep link URL to be sent when window is ready
let pendingDeepLinkUrl: string | null = null;

// Protocol name for deep linking
const PROTOCOL_NAME = 'anidock';

function createWindow(): void {
  windowManager.createMainWindow();
}

// Handle deep link URL
function handleDeepLink(url: string): void {
  console.log('Deep link received:', url);
  
  try {
    // Parse the URL: anidock://import?url=<encodedUrl>
    const parsedUrl = new URL(url);
    
    if (parsedUrl.host === 'import' || parsedUrl.pathname === '//import') {
      const driverUrl = parsedUrl.searchParams.get('url');
      
      if (driverUrl) {
        const mainWindow = windowManager.getMainWindow();
        
        if (mainWindow && !mainWindow.isDestroyed()) {
          // Send the URL to the renderer process
          mainWindow.webContents.send(IPC_CHANNELS.deepLink.importDriver, driverUrl);
          
          // Focus the window
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.focus();
        } else {
          // Store for later when window is ready
          pendingDeepLinkUrl = driverUrl;
        }
      }
    }
  } catch (error) {
    console.error('Error parsing deep link:', error);
  }
}

// Register as default protocol handler
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [process.argv[1]]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_NAME);
}

// Handle protocol on Windows/Linux when app is already running
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    // Someone tried to run a second instance, focus our window
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    
    // Handle the protocol URL from command line (Windows/Linux)
    const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL_NAME}://`));
    if (url) {
      handleDeepLink(url);
    }
  });
}

// Handle protocol on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  globalShortcut.register('F12', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.webContents.toggleDevTools();
  });
  globalShortcut.register('f12', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.webContents.toggleDevTools();
  });

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.buuhvprojects.anidock-hub');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  registerIpcHandlers(windowManager, app);
  
  // Register Puppeteer crawler IPC handlers
  ipcMain.handle(IPC_CHANNELS.crawler.fetchHTML, async (_, url: string) => {
    return await puppeteerCrawler.fetchHTML(url);
  });

  ipcMain.handle(IPC_CHANNELS.crawler.extractData, async (_, url: string, selectors: any) => {
    return await puppeteerCrawler.extractData(url, selectors);
  });

  ipcMain.handle(IPC_CHANNELS.crawler.extractVideoUrl, async (_, url: string, selectors: any) => {
    return await puppeteerCrawler.extractVideoUrl(url, selectors);
  });
  
  createWindow();
  
  // Send pending deep link URL after window is created
  if (pendingDeepLinkUrl) {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow) {
      // Wait for the window to be ready
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send(IPC_CHANNELS.deepLink.importDriver, pendingDeepLinkUrl);
        pendingDeepLinkUrl = null;
      });
    }
  }
  
  // Check if app was opened with a protocol URL (Windows/Linux cold start)
  const protocolUrl = process.argv.find(arg => arg.startsWith(`${PROTOCOL_NAME}://`));
  if (protocolUrl) {
    handleDeepLink(protocolUrl);
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await puppeteerCrawler.closeBrowser();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await puppeteerCrawler.closeBrowser();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and import them here.

