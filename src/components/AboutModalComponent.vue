<template>
  <div>
    <div class="backdrop" v-if="showModal" @click="closeModal"></div>

    <div class="about-modal" v-if="showModal">
      <span class="close-icon" @click="closeModal">
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
        For more information and to contribute to the development of MSFS Events Calendar
        Viewer, please visit the
        <a href="https://github.com/your-repo" target="_blank">GitHub repository</a>.
        <!-- ToDo: Add correct Repo URL -->
      </p>

      <ul>
        <li><strong>Version:</strong> 1.0.1-beta</li>
        <li><strong>Developer:</strong> SoBo7a</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutModalComponent",
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

<style scoped>
.about-modal-open {
  overflow: hidden;
}

.backdrop {
  position: fixed;
  top: var(--titlebar-height);
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Adjust the opacity to your preference */
  backdrop-filter: blur(8px); /* Apply the blur effect */
  z-index: 9998;
}

.about-modal {
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--about-background-color);
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

.shortened-url {
  max-width: 30vw; /* Adjust the max-width to your preference */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 24px;
  color: var(--text-color-primary);
  transition: color 0.3s ease;
}

.close-icon:hover {
  color: #777;
}

h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-bottom: 10px;
}

li {
  margin-bottom: 5px;
}

p {
  margin-bottom: 10px;
}

a {
  color: var(--link-color);
  text-decoration: underline;
}

a:hover {
  color: var(--link-color-hover);
}
</style>
