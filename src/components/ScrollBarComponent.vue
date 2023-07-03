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
      let windowHeight = window.innerHeight || document.documentElement.clientHeight;
      windowHeight -= this.titlebarHeight;
      const contentHeight = document.documentElement.scrollHeight;
      
      // Adjust the scroll height and thumb height based on the content height
      this.scrollHeight = Math.max(contentHeight - windowHeight, 0);
      this.thumbHeight = (windowHeight / (contentHeight || 1)) * windowHeight;

      // Calculate the position of the scrollbar thumb relative to the scrollable content
      let maxThumbPosition = windowHeight - this.thumbHeight;
      if (this.scrollHeight < 1000) {
        maxThumbPosition = windowHeight - this.thumbHeight + this.titlebarHeight;
      }

      if (this.scrollHeight <= this.titlebarHeight) {
        this.showScrollbar = false;
      } else if (this.scrollHeight > this.titlebarHeight) {
        this.showScrollbar = true;
      }
      
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
