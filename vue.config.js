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


const { defineConfig } = require("@vue/cli-service");
require('dotenv').config();

module.exports = {
  ...defineConfig({
    devServer: {
      proxy: {
        '/api': {
          target: 'http://localhost:8082',
          ws: true,
          changeOrigin: true,
        },
      },
    }, // ToDo Check if it can be removed as no server.js in use anymore

    transpileDependencies: ["axios"],

    pluginOptions: {
      electronBuilder: {
        nodeIntegration: true,
        contextIsolation: true,

        builderOptions: {
            appId: 'msfs-events-calendar-app',
            productName: 'MSFS Events Calendar Viewer',
            buildVersion: '1.0.1-beta',
            "publish": [
              {
                "provider": "github",
                "owner": "SoBo7a",
                "repo": "MSFS-Events-Calendar-Viewer"
              }
            ],
            win: {
                "target": [
                    "nsis"
                ],
              icon: 'public/icon.png',
            },
            "nsis": {
                "installerIcon": "public/icon.ico",
                "uninstallerIcon": "public/icon.ico",
                "uninstallDisplayName": "MSFS Events Calendar Viewer",
                "oneClick": false,
                "allowToChangeInstallationDirectory": true,
            },
            extraFiles: [
              {
                "from": "LICENSE.MSFS_Events_Calendar_Viewer.txt",
                "to": "LICENSE.MSFS_Events_Calendar_Viewer.txt",
                "filter": ["**/*"]
              },
              {
                "from": "README.md",
                "to": "README.md",
                "filter": ["**/*"]
              },
              {
                "from": "ThirdPartyNotices.txt",
                "to": "ThirdPartyNotices.txt",
                "filter": ["**/*"]
              },
            ]
        },
      }
    }
    
  })
};
