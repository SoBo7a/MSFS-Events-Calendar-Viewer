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
