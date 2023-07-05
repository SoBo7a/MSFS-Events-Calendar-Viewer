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
    :class="{ pulsing: state === 'downloading' }"
  >
    <div class="update-close-button" v-if="state === 'downloaded'" @click="installLater">
      <span>&times;</span>
    </div>
    <div class="update-icon-container">
      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="icon" />
    </div>
    <span
      v-if="state === 'downloading'"
      class="update-message"
      v-html="downloadingMessage"
    ></span>
    <div v-if="state === 'downloaded'" class="downloaded-container">
      <span class="update-message" v-html="downloadedMessage"></span>
      <div class="update-button-container">
        <button class="later-button" @click="installLater" title="Install after closing the application.">Later</button>
        <button class="install-button" @click="installNow" title="Close the application and update now.">Install Now</button>
      </div>
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
      downloadingMessage: "",
      downloadedMessage: "",
    };
  },

  created() {
    ipcRenderer.on("update_available", () => {
      this.showDownloadingNotification();
    });

    ipcRenderer.on("update_downloaded", () => {
      this.showDownloadedNotification();
    });
  },

  methods: {
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

<style scoped lang="scss">
@keyframes pulse {
  0% {
    transform: scale(1);
    filter: brightness(100%);
  }
  50% {
    transform: scale(0.97);
    filter: brightness(80%);
  }
  100% {
    transform: scale(1);
    filter: brightness(100%);
  }
}

.update-notification {
  position: fixed;
  top: calc(var(--titlebar-height) + 5px);
  left: 5px; /* Adjusted to position the notification at the top right corner */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--modal-background-color);
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
  border-radius: 5px;
  font-size: 14px;
  color: var(--text-color-primary);
  font-family: Arial, sans-serif;
  z-index: 9999;

  &.pulsing {
    animation: pulse 1s infinite;
  }

  .update-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;

    .icon {
      font-size: 24px;
      color: var(--text-color-primary); /* Set the desired color for the icon */
    }
  }

  .update-message {
    text-align: center;
    font-weight: 700;
  }

  .update-button-container {
    margin-top: 10px;
    display: flex;
    justify-content: space-between; /* Add this line to create space between the buttons */

    .install-button,
    .later-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      font-weight: 700;
      transition: background-color 0.3s ease;

      &.install-button {
        background-color: #007bff;
        color: #fff;
      }

      &.later-button {
        background-color: #6c757d;
        color: #fff;
        margin-right: 10px;
      }

      &:hover {
        background-color: #0056b3;
      }

      &:active {
        background-color: #003580;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
      }
    }
  }

  .update-close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    cursor: pointer;
    font-size: 18px;
    color: var(--text-color-primary); /* Set the desired color for the close button */

    &:hover {
      color: #ff0000; /* Set the desired hover color for the close button */
    }
  }
}
</style>
