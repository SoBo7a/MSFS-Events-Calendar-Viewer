<!---------------------------------------------------------------------------------------------
 * Copyright (c) 2023 SoBo7a.
 * 
 * This file is part of MSFS Events Calendar Viewer <linkToMyRepo>.
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
  <div v-if="showScrollbar" class="custom-scrollbar">
    <div
      class="scrollbar-track"
      @mousedown.prevent="handleTrackClick"
      ref="scrollbarTrack"
    >
      <div
        class="scrollbar-thumb"
        :style="thumbStyle"
        @mousedown.prevent="startDrag"
        ref="thumb"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ScrollBarComponent",
  data() {
    return {
      showScrollbar: true,

      titlebarHeight: 32, // Height of titlebar in PX. Set to 0 if no custom titlebar set

      scrollHeight: 0, // Total scrollable height
      thumbHeight: 0, // Height of the scrollbar thumb
      thumbPosition: 0, // Position of the scrollbar thumb
      isDragging: false, // Indicates if the thumb is being dragged
      startY: 0, // Y coordinate where the drag started
      startThumbPosition: 0, // Initial position of the thumb when the drag started
    };
  },
  props: {
    contentReady: {
      type: Boolean,
      default: true,
      required: false,
    },
  },
  mounted() {
    if (this.contentReady) {
      this.calculateScrollbar();
    }

    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.calculateScrollbar);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.calculateScrollbar);
  },
  methods: {
    handleScroll() {
      this.calculateScrollbar();
    },

    calculateScrollbar() {
      const windowScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const contentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );

      const scrollableHeight = contentHeight - windowHeight;
      const hasScrollableContent = scrollableHeight > 0;

      this.showScrollbar = hasScrollableContent;

      if (hasScrollableContent) {
        const availableHeight = windowHeight - this.titlebarHeight;
        this.scrollHeight = scrollableHeight;
        this.thumbHeight = Math.max((availableHeight / contentHeight) * availableHeight, 20); // Minimum thumb height of 20px
        this.thumbPosition = (windowScrollTop / scrollableHeight) * (availableHeight - this.thumbHeight);
      } else {
        this.scrollHeight = 0;
        this.thumbHeight = 0;
        this.thumbPosition = 0;
      }
    },

    startDrag(event) {
      this.isDragging = true;
      this.startY = event.clientY;
      this.startThumbPosition = this.thumbPosition;
      window.addEventListener("mousemove", this.dragThumb);
      window.addEventListener("mouseup", this.stopDrag);
    },

    dragThumb(event) {
      if (this.isDragging) {
        const deltaY = event.clientY - this.startY;
        const maxThumbPosition =
          window.innerHeight - this.titlebarHeight - this.thumbHeight;
        const newThumbPosition = this.startThumbPosition + deltaY;

        // Ensure the new thumb position stays within the bounds
        this.thumbPosition = Math.max(0, Math.min(newThumbPosition, maxThumbPosition));

        // Calculate the scroll position based on the thumb position
        const scrollPercentage = this.thumbPosition / maxThumbPosition;
        window.scrollTo(0, scrollPercentage * this.scrollHeight);
      }
    },

    stopDrag() {
      this.isDragging = false;
      window.removeEventListener("mousemove", this.dragThumb);
      window.removeEventListener("mouseup", this.stopDrag);
    },

    handleTrackClick(event) {
      const trackRect = this.$refs.scrollbarTrack.getBoundingClientRect();
      const clickPosition = event.clientY - trackRect.top;
      const maxThumbPosition = window.innerHeight - this.thumbHeight;

      // Calculate the new thumb position based on the click position within the track
      const newThumbPosition = clickPosition - this.thumbHeight / 2;

      // Calculate the scroll position based on the thumb position
      const scrollPercentage = newThumbPosition / maxThumbPosition;
      const targetScrollTop = scrollPercentage * this.scrollHeight;

      // Scroll to the target position with smooth animation
      window.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    },
  },
  watch: {
    contentReady(newVal) {
      if (newVal) {
        setTimeout(() => {
          this.calculateScrollbar();
        }, 100); // 5 ms on mid-end system are sufficient, setting 100ms for safety reasons
      }
    },
  },
  computed: {
    thumbStyle() {
      return {
        height: `${this.thumbHeight}px`,
        transform: `translateY(${this.thumbPosition}px)`,
      };
    },
  },
};
</script>
