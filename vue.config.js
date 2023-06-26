const { defineConfig } = require("@vue/cli-service");

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
    },

    transpileDependencies: ["axios"],

    pluginOptions: {
      electronBuilder: {
        nodeIntegration: true,

        builderOptions: {
            appId: 'msfs-events-calendar-app',
            productName: 'MSFS Events Calendar',
            buildVersion: '1.0.0-beta',
            win: {
                "target": [
                    "nsis"
                ],
              icon: 'public/icon.png',
            },
            "nsis": {
                "installerIcon": "public/icon.ico",
                "uninstallerIcon": "public/icon.ico",
                "uninstallDisplayName": "MSFS Events Calendar",
                "oneClick": false,
                "allowToChangeInstallationDirectory": true
            }
        },
      }
    }
    
  })
};
