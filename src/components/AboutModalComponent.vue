<!---------------------------------------------------------------------------------------------
 * Copyright (c) 2023 SoBo7a.
 * 
 * This file is part of MSFS Events Calendar Viewer <linkToMyRepo>.
 * 
 * MSFS Events Calendar Viewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
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
        <a href="https://github.com/your-repo" target="_blank" title="https://github.com/your-repo">GitHub repository</a>.
        <!-- ToDo: Add correct Repo URL -->
      </p>

      <ul>
        <li><strong>Version:</strong> {{ appVersion }}</li>
        <li><strong>Copyright<small style="vertical-align: top;">&copy;</small>:</strong> 2023 SoBo7a</li>
        <li><strong>License:</strong> <a href="https://www.gnu.org/licenses/gpl-3.0" target="_blank" title="https://www.gnu.org/licenses/gpl-3.0">GPLv3</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutModalComponent",
  data() {
    return {
        appVersion: require("../../package.json").version,
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
      // Add/remove 'modal-open' class to the body when the showModal prop changes
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
  },
};
</script>