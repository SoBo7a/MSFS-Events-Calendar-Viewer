<!---------------------------------------------------------------------------------------------
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
 * -------------------------------------------------------------------------------------------->

<template>
  <div
    v-if="visible"
    class="update-notification"
    :class="{ pulsing: state === 'downloading' || state === 'error', updated: state === 'updated' }"
  >
    <div class="update-close-button" v-if="state === 'downloaded'" @click="installLater">
      <span>&times;</span>
    </div>
    <div class="update-icon-container">
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="icon" :class="{ error: state === 'error' }" />
    </div>
    <span
      v-if="state === 'error'"
      class="error-message"
      v-html="errorMessage"
    ></span>
    <span
      v-if="state === 'downloading'"
      class="update-message"
      v-html="downloadingMessage"
    ></span>
    <div v-if="state === 'downloading'" class="progress-bar-container">
      <div class="progress-bar" :style="{ width: downloadProgress + '%' }"></div>
      <div class="progress-label">{{ downloadProgress.toFixed(0) }}%</div>
    </div>
    <br>
    <div v-if="state === 'downloaded'" class="downloaded-container">
      <span class="update-message" v-html="downloadedMessage"></span>
      <div class="update-button-container">
        <button class="later-button" @click="installLater" title="Install after closing the application.">Later</button>
        <button class="install-button" @click="installNow" title="Close the application and update now.">Install Now</button>
      </div>
    </div>
    <div v-if="state === 'updated'" class="updated-container">
      <span class="update-message">
        The app has been updated to version:
        <br><br>
        <strong>v{{ updatedVersion }}</strong>
      </span>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  name: "UpdateNotificationComponent",

  data() {
    return {
      visible: false,
      state: "",
      errorMessage: "",
      downloadingMessage: "",
      downloadedMessage: "",
      updatedVersion: "",
      downloadProgress: 0,
    };
  },

  created() {
    ipcRenderer.on("update_error", (event, error) => {
      this.showUpdateErrorNotification(error);
    });

    ipcRenderer.on("app-updated", (event, version) => {
      this.showUpdatedNotification(version);
    });

    ipcRenderer.on("update_available", () => {
      this.showDownloadingNotification();
    });

    ipcRenderer.on('download-progress', (event, downloadProgress) => {
      this.downloadProgress = downloadProgress;
    });

    ipcRenderer.on("update_downloaded", (event) => {
      this.showDownloadedNotification(event);
    });
  },

  methods: {
    showUpdateErrorNotification(error) {
      this.state = "error";
      this.visible = true;
      this.errorMessage = error.stack.replace(/\n/g, "<br>");

      console.error(this.errorMessage)

      setTimeout(() => {
        this.visible = false;
        this.state = "";
      }, 20000);
    },

    showUpdatedNotification(version) {
      this.state = "updated";
      this.visible = true;
      this.updatedVersion = version;

      setTimeout(() => {
        this.visible = false;
        this.state = "";
      }, 8000);
    },

    showDownloadingNotification() {
      this.state = "downloading";
      this.visible = true;
      this.downloadingMessage = "A new update is available.<br>Downloading now...";
    },

    showDownloadedNotification() {
      this.state = "downloaded";
      this.visible = true;
      this.downloadedMessage = "New update downloaded.<br>Do you want to install it now?";
    },

    installNow() {
      this.visible = false;
      ipcRenderer.send("install-now");
    },

    installLater() {
      this.visible = false;
    },
  },
};
</script>
