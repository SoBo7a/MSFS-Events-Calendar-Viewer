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


/**
 * Mixin for scroll-up-button functionality
 * Example Usage:
 *
 * <template>
 *   // ...
 *   <font-awesome-icon v-show="!scrolledToTop" class="scroll-up-button" :icon="['fas', 'arrow-up']" title="Scroll to the top..." @click="scrollToTop()" />
 * </template>
 *
 * <script>
 *  * import scrollMixin from '@/mixins/scrollMixin.js';
 *   export default {
 *      name: 'MyComponent',
 *      mixins: [scrollMixin],
 *      // ...
 *   }
 * </script>
 */
export default {
  data() {
    return {
      scrolledToTop: true,
    };
  },

  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        this.scrolledToTop = true;
      }, 1000);
    },

    handleScroll() {
      this.scrolledToTop = window.scrollY <= 3;
    },
  },

  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
