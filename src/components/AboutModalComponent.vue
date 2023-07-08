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
  <div>
    <div class="backdrop" v-if="showModal" @click="closeModal"></div>

    <div class="about-modal" v-if="showModal">
      <span class="close-icon" @click="closeModal" title="Close">
        <font-awesome-icon :icon="['fas', 'circle-xmark']" class="fa-icon" />
      </span>

      <h2>About - MSFS Events Calendar Viewer</h2>
      <p>
        <strong>Data provided by:</strong>
        <br />
        Microsoft<small style="vertical-align: top">&copy;</small> Flight Simulator Forums
        - Events Calendar
        <br />
        <a
          href="https://forums.flightsimulator.com/c/msfs/community-fly-in-events/143/l/calendar"
          target="_blank"
          title="https://forums.flightsimulator.com/c/msfs/community-fly-in-events/143/l/calendar"
          class="shortened-url"
          >Learn more</a
        >
      </p>
      <p>
        MSFS Events Calendar Viewer is an independent desktop application developed to
        provide a convenient way to explore and stay updated on flight simulation events.
        It utilizes the Microsoft Flight Simulator Forums Calendar as its data source,
        offering users a comprehensive view of community-driven events. Please note that
        MSFS Events Calendar Viewer is not affiliated with or endorsed by Microsoft Flight
        Simulator or its developers.
      </p>
      <p>
      This program comes with ABSOLUTELY NO WARRANTY.
      </p>
      <p>
        For more information and to contribute to the development of MSFS Events Calendar
        Viewer, please visit the
        <a href="https://github.com/SoBo7a/MSFS-Events-Calendar-Viewer" target="_blank" title="https://github.com/SoBo7a/MSFS-Events-Calendar-Viewer">GitHub repository</a>.
      </p>

      <ul>
        <li>
            <strong>Version:</strong> {{ appVersion }}
            <font-awesome-icon
                :icon="['fa', 'arrows-rotate']"
                class="fa-icon update-icon"
                :class="{ 'rotate': isUpdating }"
                @click="checkForUpdates"
                title="Check for Updates"
            />
            <div v-if="showNoUpdateMsg" class="update-not-found pulsing" style="color: green;"><strong>You already use the latest version...</strong></div>
        </li>
        <li v-if="showErrorMsg" class="error-msg pulsing" style="color: red;"><strong>Failed to check for updates...</strong></li>

        <li><strong>Copyright<small style="vertical-align: top;">&copy;</small>:</strong> 2023 <a href="https://github.com/SoBo7a" target="_blank" title="https://github.com/SoBo7a">SoBo7a</a></li>
        <li><strong>License:</strong> <a href="https://www.gnu.org/licenses/gpl-3.0" target="_blank" title="https://www.gnu.org/licenses/gpl-3.0">GPLv3</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";


export default {
  name: "AboutModalComponent",

  data() {
    return {
        appVersion: require("../../package.json").version,
        showNoUpdateMsg: false,
        isUpdating: false,
        showErrorMsg: false,

        timeToUpdateTimeout: 15000,
        timeToShowMsg: 10000,
    }
  },

  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
  },

  watch: {
    showModal(value) {
      if (value) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
  },

  methods: {
    closeModal() {
      this.$emit("toggle-modal");
    },

    checkForUpdates() {
      if (this.isUpdating) {
        return;
      }

      this.isUpdating = true;
      ipcRenderer.send("check-for-updates");

      const updateTimeout = setTimeout(() => {
        this.handleUpdateTimeout();
      }, this.timeToUpdateTimeout);

      ipcRenderer.on("update_error", () => {
        clearTimeout(updateTimeout);
        this.handleUpdateError();
      });

      ipcRenderer.on("update_not_found", () => {
        clearTimeout(updateTimeout);
        this.handleUpdateNotFound();
      });

      ipcRenderer.on("update_available", () => {
        clearTimeout(updateTimeout);
        this.handleUpdateAvailable();
      });
    },

    handleUpdateTimeout() {
      this.showNoUpdateMsg = false;
      this.showErrorMsg = true;
      this.isUpdating = false;

      setTimeout(() => {
        this.showErrorMsg = false;
      }, this.timeToShowMsg);
    },

    handleUpdateError() {
      this.showNoUpdateMsg = false;
      this.showErrorMsg = true;
      this.isUpdating = false;

      setTimeout(() => {
        this.showErrorMsg = false;
      }, this.timeToShowMsg);
    },

    handleUpdateNotFound() {
      this.showNoUpdateMsg = true;
      this.showErrorMsg = false;
      this.isUpdating = false;

      setTimeout(() => {
        this.showNoUpdateMsg = false;
      }, this.timeToShowMsg);
    },

    handleUpdateAvailable() {
      this.isUpdating = false;
      this.showNoUpdateMsg = false;
      this.showErrorMsg = false;
    },
  },
};
</script>