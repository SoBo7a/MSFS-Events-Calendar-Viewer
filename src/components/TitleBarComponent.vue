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
  <div class="title-bar" @mousedown="handleMouseDown">
    <div class="about-page-toggle" @click="showAboutModal = !showAboutModal" title="About" >
      <font-awesome-icon :icon="['fas', 'circle-info']" class="fa-icon"/>
    </div>
    <div class="dark-mode-toggle" @click="toggleDarkMode" title="Disable Darkmode">
      <font-awesome-icon v-if="darkModeEnabled" :icon="['fas', 'sun']" class="fa-icon" />
      <font-awesome-icon v-else :icon="['fas', 'moon']" class="fa-icon" title="Enable Darkmode" />
    </div>
    <div class="title">{{ pageTitle }}</div>
    <div class="buttons">
      <div class="button minimize" @click="minimizeWindow" title="Minimize">
        <font-awesome-icon :icon="['far', 'window-minimize']" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
      <div class="button maximize" @click="toggleMaximize" :title="isMaximized ? 'Restore' : 'Maximize'">
        <font-awesome-icon :icon="getMaximizeIcon()" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
      <div class="button close" @click="closeWindow" title="Close">
        <font-awesome-icon :icon="['far', 'window-close']" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
    </div>
  </div>

  <AboutModalComponent :showModal="showAboutModal" @toggle-modal="toggleModal"></AboutModalComponent>
</template>

<script>
import { ipcRenderer } from 'electron';
import router from "@/router"; // Import your Vue Router instance

import AboutModalComponent from './AboutModalComponent.vue'

export default {
  name: "TitleBarComponent",

  components: {
    AboutModalComponent,
  },

  data() {
    return {
      pageTitle: document.title,
      isMaximized: false,

      darkModeEnabled: false,

      showAboutModal: false,
    };
  },

  mounted() {
    // Listen for route changes and update the page title
    router.beforeEach((to) => {
      this.pageTitle = to.meta && to.meta.title ? to.meta.title : "Default Title";
    });

    document.addEventListener("DOMContentLoaded", () => {
      this.pageTitle = document.title;
    });

    setTimeout(() => {
      this.isMaximized = ipcRenderer.sendSync("get-window-maximized-state");
    }, 1000);

    ipcRenderer.on("window-maximized-state-changed", (event, isMaximized) => {
      this.isMaximized = isMaximized;
    });

    ipcRenderer.on('window-maximized', () => {
      this.isMaximized = true;
    });

    ipcRenderer.on('window-restored', () => {
      this.isMaximized = false;
    });

    this.setInitialDarkModeSettings();
  },

  methods: {
    toggleModal() {
      this.showAboutModal = !this.showAboutModal;
    },
    
    handleMouseDown(event) {
      // eslint-disable-next-line
      const { screenX, screenY } = event;
      const currentWindowPosition = ipcRenderer.sendSync("get-window-position");

      const onMouseMove = (event) => {
        const { screenX, screenY } = event;
        const { 0: startX, 1: startY } = currentWindowPosition;

        const offsetX = screenX - startX;
        const offsetY = screenY - startY;

        ipcRenderer.send("move-window", { offsetX, offsetY });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },

    minimizeWindow() {
      ipcRenderer.send("minimize-window");
    },

    toggleMaximize() {
      ipcRenderer.send("toggle-maximize");
    },

    closeWindow() {
      ipcRenderer.send("close-window");
    },

    getMaximizeIcon() {
      return this.isMaximized ? ["far", "window-restore"] : ["far", "window-maximize"];
    },

    setInitialDarkModeSettings() {
      const darkModeStatus = ipcRenderer.sendSync('get-dark-mode-status');
      this.darkModeEnabled = darkModeStatus;
      
      if (this.darkModeEnabled) {
        document.documentElement.classList.add("dark-mode"); // Apply the dark mode class to the root element
      } else {
        document.documentElement.classList.remove("dark-mode"); // Remove the dark mode class from the root element
      }
    },

    toggleDarkMode() {
      const darkModeStatus = ipcRenderer.sendSync('get-dark-mode-status');

      this.darkModeEnabled = !darkModeStatus;

      // Send an IPC message to the main process to update the dark mode status
      ipcRenderer.send('toggle-dark-mode', this.darkModeEnabled);

      if (this.darkModeEnabled) {
        document.documentElement.classList.add("dark-mode"); // Apply the dark mode class to the root element
      } else {
        document.documentElement.classList.remove("dark-mode"); // Remove the dark mode class from the root element
      }
    },
  },
};
</script>
