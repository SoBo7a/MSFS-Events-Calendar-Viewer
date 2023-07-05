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
  <TitleBarComponent />

  <div class="border-overlay"></div>

  <router-view />
</template>

<script>
import TitleBarComponent from './components/TitleBarComponent.vue';

export default {
  name: 'App',

  components: {
    TitleBarComponent,
  },
  
}
</script>

<style lang="scss">
.border-overlay {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px; /* Adjust the height of the border as needed */
  background-color: #000; /* Adjust the color of the border as needed */
  z-index: 1; /* Ensure the border overlay is above the content */
}
</style>
