<template>
  <div class="custom-scrollbar">
    <div
      class="scrollbar-track"
      @mousedown.prevent="handleTrackClick"
      ref="scrollbarTrack"
    >
      <div
        class="scrollbar-thumb"
        :style="thumbStyle"
        @mousedown="startDrag"
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
      this.scrollHeight = document.documentElement.scrollHeight - windowHeight;
      this.thumbHeight = ((windowHeight / this.scrollHeight) * windowHeight) / 2;

      // Calculate the position of the scrollbar thumb relative to the scrollable content
      const maxThumbPosition = windowHeight - this.thumbHeight;
      this.thumbPosition = (windowScrollTop / this.scrollHeight) * maxThumbPosition;
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
        const maxThumbPosition = window.innerHeight - this.thumbHeight;
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

      // Ensure the new thumb position stays within the bounds
      this.thumbPosition = Math.max(0, Math.min(newThumbPosition, maxThumbPosition));

      // Calculate the scroll position based on the thumb position
      const scrollPercentage = this.thumbPosition / maxThumbPosition;
      window.scrollTo(0, scrollPercentage * this.scrollHeight);
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

<style scoped>
.custom-scrollbar {
  position: relative;
  width: 10px;
}

.scrollbar-track {
  position: fixed;
  top: 35px;
  right: 5px;
  bottom: 3px;
  width: 10px;
  background-color: #f1f1f1;
  border-radius: 5px;
  overflow: hidden;
}

.scrollbar-thumb {
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #008cdd;
  border-radius: 5px;
}
</style>
