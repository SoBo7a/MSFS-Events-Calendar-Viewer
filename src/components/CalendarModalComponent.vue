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
        console.error("Invalid Option");
      }
    },

    closeModal() {
      this.$emit("update:show-modal", false);
    },
  },
};
</script>