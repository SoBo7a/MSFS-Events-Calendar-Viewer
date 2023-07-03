<template>
  <div class="title-bar" @mousedown="handleMouseDown">
    <div class="dark-mode-toggle" @click="toggleDarkMode">
      <font-awesome-icon v-if="darkModeEnabled" :icon="['fas', 'sun']" class="fa-icon" title="Disable Darkmode" />
      <font-awesome-icon v-else :icon="['fas', 'moon']" class="fa-icon" title="Enable Darkmode" />
    </div>
    <div class="title">{{ pageTitle }}</div>
    <div class="buttons">
      <div class="button minimize" @click="minimizeWindow">
        <font-awesome-icon :icon="['far', 'window-minimize']" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
      <div class="button maximize" @click="toggleMaximize">
        <font-awesome-icon :icon="getMaximizeIcon()" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
      <div class="button close" @click="closeWindow">
        <font-awesome-icon :icon="['far', 'window-close']" class="fa-icon" />
        <div class="button-overlay"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import router from "@/router"; // Import your Vue Router instance

export default {
  name: "TitleBarComponent",

  data() {
    return {
      pageTitle: document.title,
      isMaximized: false,

      darkModeEnabled: false,
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

    // Request the dark mode status from the main process
    ipcRenderer.send('get-dark-mode-status');

    // Listen for the response from the main process
    ipcRenderer.on('dark-mode-status', (event, isDarkMode) => {
      // Use the dark mode status in your component
      if (isDarkMode) {
        // System is in dark mode
        // Apply dark mode styles or logic
        this.toggleDarkMode();
      }
    });
  },

  methods: {
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

    toggleDarkMode() {
      this.darkModeEnabled = !this.darkModeEnabled; // Toggle the dark mode state

      if (this.darkModeEnabled) {
        document.documentElement.classList.add("dark-mode"); // Apply the dark mode class to the root element
      } else {
        document.documentElement.classList.remove("dark-mode"); // Remove the dark mode class from the root element
      }
    },
  },
};
</script>
