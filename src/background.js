/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2023 SoBo7a.
 * 
 * This file is part of MSFS Events Calendar Viewer https://github.com/SoBo7a/MSFS-Events-Calendar-Viewer.
 * 
 * MSFS Events Calendar Viewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * MSFS Events Calendar Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MSFS Events Calendar Viewer.  If not, see <http://www.gnu.org/licenses/>.
 *--------------------------------------------------------------------------------------------*/


'use strict'

import { app, ipcMain, protocol, BrowserWindow, shell, nativeTheme } from 'electron'
import { autoUpdater } from 'electron-updater'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'

import fs from 'fs'
import path from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

const tempDir = app.getPath('temp');
const versionFilePath = path.join(tempDir, 'msfs_events_viewer_version.txt');

const configPath = path.join(app.getPath('appData'), 'msfs-events-calender-app', 'Config', 'config.json');

require('@electron/remote/main').initialize()


function readWindowSettings() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return configData.windowSettings;
    }
  } catch (err) {
    console.error('Error reading window settings from config file:', err);
  }
  return null;
}

function writeWindowSettings(windowSettings) {
  try {
    const configData = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : {};
    configData.windowSettings = windowSettings;
    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(configData), 'utf8');
  } catch (err) {
    console.error('Error writing window settings to config file:', err);
  }
}

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

  const windowSettings = readWindowSettings();
  if (windowSettings) {
    if (windowSettings.isMaximized) {
      win.maximize();
    } else {
      win.setSize(windowSettings.width, windowSettings.height);
      win.setPosition(windowSettings.x, windowSettings.y);
    }
  }
  
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

  autoUpdater.on('error', (error) => {
    win.webContents.send('update_error', error);
  })

  win.once('ready-to-show', () => {
    // Check if update was installed
    if (fs.existsSync(versionFilePath)) {
      if (fs.readFileSync(versionFilePath, 'utf8') !== app.getVersion()) {
        let changelogPath
        if (process.env.WEBPACK_DEV_SERVER_URL) {
          changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
        } else {
          changelogPath = path.join(__dirname, '..', '..', 'CHANGELOG.md');
        }
        const releaseNotes = fs.readFileSync(changelogPath, 'utf8');
        const version = app.getVersion();
        win.webContents.send('app-updated', {
          version: version,
          releaseNotes: releaseNotes,
        });
      }
      fs.unlinkSync(versionFilePath);
    }

    autoUpdater.checkForUpdates();
  });

  ipcMain.on("check-for-updates", () => {
    autoUpdater.on("update-not-available", () => {
      win.webContents.send("update_not_found");
  });
  
    autoUpdater.checkForUpdates();
  });

  autoUpdater.on('update-available', () => {
    win.webContents.send('update_available');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    const downloadProgress = progressObj.percent;
    win.webContents.send('download-progress', downloadProgress);
  });
  
  let updateDownloaded = false;
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
    updateDownloaded = true;

    // Create Text file with current version to use for check, if update was installed
    fs.writeFileSync(versionFilePath, app.getVersion());
  });
  
  ipcMain.on('install-now', () => {
    setImmediate(() => {
      autoUpdater.quitAndInstall(true, true);
    })
  });

  ipcMain.on('get-window-position', (event) => {
    const position = win.getPosition();
    event.returnValue = position;
  });

  ipcMain.on('minimize-window', () => {
    win.minimize();
  });

  ipcMain.on('toggle-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
    const isMaximized = win.isMaximized();
    writeWindowSettings({ ...windowSettings, isMaximized });
    win.webContents.send('window-maximized-state-changed', isMaximized);
  });

  win.on('maximize', () => {
    const updatedWindowSettings = { ...windowSettings, isMaximized: true };
    writeWindowSettings(updatedWindowSettings);
    win.webContents.send('window-maximized');
  });
  
  win.on('unmaximize', () => {
    const updatedWindowSettings = { ...windowSettings, isMaximized: false };
    writeWindowSettings(updatedWindowSettings);
    win.webContents.send('window-restored');
  });

  ipcMain.on('get-window-maximized-state', (event) => {
    event.returnValue = win.isMaximized();
  });

  ipcMain.on('close-window', () => {
    if (win.isDevToolsOpened()) {
      win.closeDevTools();
    }
  
    const windowSettings = {
      isMaximized: win.isMaximized(),
      width: win.getSize()[0],
      height: win.getSize()[1],
      x: win.getPosition()[0],
      y: win.getPosition()[1],
    };
    writeWindowSettings(windowSettings);
  
    win.close();
  });  
}

app.on('ready', () => {
  // Allows Cross-Origin iframes to show and minipulate them
  const { session } = require('electron');
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['frame-src *']
      }
    });
  });

  ipcMain.on('get-dark-mode-status', (event) => {
    let darkModeStatus = nativeTheme.shouldUseDarkColors;
  
    if (fs.existsSync(configPath)) {
      try {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        darkModeStatus = configData.darkModeStatus;
      } catch (err) {
        console.error('Error reading config file:', err);
      }
    } else {
      try {
        const defaultConfigData = { darkModeStatus };
        if (!fs.existsSync(path.dirname(configPath))) {
          fs.mkdirSync(path.dirname(configPath), { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify(defaultConfigData), 'utf8');
      } catch (err) {
        console.error('Error creating config file:', err);
      }
    }
  
    event.returnValue = darkModeStatus;
  });

  ipcMain.on('toggle-dark-mode', (event, enableDarkMode) => {
    try {
      let configData = {};
      
      if (fs.existsSync(configPath)) {
        configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
  
      configData.darkModeStatus = enableDarkMode;
      
      if (!fs.existsSync(path.dirname(configPath))) {
        fs.mkdirSync(path.dirname(configPath), { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify(configData), 'utf8');
  
      event.returnValue = enableDarkMode; // Return the updated dark mode status
    } catch (err) {
      console.error('Error updating config file:', err);
    }
  });  
});

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
      // eslint-disable-next-line
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
