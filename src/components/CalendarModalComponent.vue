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
  <div class="modal" v-if="showModal" @click="closeModal">
    <div class="modal-content" @click.stop>
      <button class="close-button" @click="closeModal">x</button>
      <h3 class="modal-title">Choose an option</h3>
      <div class="modal-buttons">
        <button class="modal-button" @click.stop="selectOption('ics')" title="Download as .ics File">
            <font-awesome-icon :icon="['fas', 'calendar-plus']" /> .ics File
        </button>
        <button class="modal-button" @click.stop="selectOption('google')" title="Add to Google Calendar">
            <font-awesome-icon :icon="['fab', 'google']" /> Google Calendar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalendarModalComponent",

  props: {
    showModal: {
      type: Boolean,
      required: true,
      default: false,
    },
  },

  methods: {
    selectOption(option) {
      if (option === "google") {
        this.closeModal();
        this.$emit("option-selected", option);
      } else if (option === "ics") {
        this.closeModal();
        this.$emit("option-selected", option);
      } else {
        // eslint-disable-next-line
        console.error("Invalid Option");
      }
    },

    closeModal() {
      this.$emit("update:show-modal", false);
    },
  },
};
</script>