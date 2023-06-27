'use strict'

import { app, ipcMain, protocol, BrowserWindow, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

require('@electron/remote/main').initialize()

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1000,
    minWidth: 680,
    height: 1100,
    minHeight: 680,
    frame: false,
    // transparent: true, // Cant Snap Windows if used...

    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
      webSecurity: false,  // Disabled in Order to have working CORS in server.js
      nativeWindowOpen: true,
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  
  ipcMain.on('get-window-position', (event) => {
    const position = win.getPosition();
    event.returnValue = position;
  });

  // Handle window minimize
  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  // Handle window maximize state request
  ipcMain.on('get-window-maximized-state', (event) => {
    const isMaximized = win.isMaximized();
    event.returnValue = isMaximized;
  });

  // Handle window maximize/restore toggle
  ipcMain.on('toggle-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    const isMaximized = win.isMaximized();
    win.webContents.send('window-maximized-state-changed', isMaximized);
  });

  // Handle window close
  ipcMain.on('close-window', () => {
    if (win.isDevToolsOpened()) {
      win.closeDevTools();
    }
    
    win.close();
  });
}

app.commandLine.appendSwitch('disable-site-isolation-trials'); // Allows Cross-Origin iframe-manipulation

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
