<template>
  <BackgroundSlideshowComponent></BackgroundSlideshowComponent>

  <notifications position="bottom right" :pauseOnHover="true" :duration="5000" classes="notification-base" title="Click to close this notification..." />

  <div class="event-details-wrapper">
    <router-link to="/" title="Go back to the Overview..." class="home-link menu-icon">
      <font-awesome-icon :icon="['fas', 'house-chimney']" />    
    </router-link>
    <font-awesome-icon class="menu-icon" :icon="['fas', 'arrows-rotate']" title="Refresh page contents..." @click="fetchEventDetails()" />
    <font-awesome-icon class="menu-icon" :icon="['fab', 'chrome']" title="Open this Event in your Browser..." @click="openEventInBrowser()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'copy']" title="Copy the URL of this Event to your Clipboard..." @click="saveToClipboard()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'print']" title="Print the current page..." @click="printPage()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'calendar-days']" title="Add Event to Calendar..." @click="showCalendarPopup()" />

    <font-awesome-icon class="menu-icon" :icon="['fas', 'arrow-up']" title="Scroll to the top..." @click="scrollToTop()" />

    <h1 class="event-details-title">{{ eventDetails.fancy_title }}</h1>

    <div class="event-posts-container">
      <div v-for="(post, index) in eventPosts" :key="post.id" class="event-post" :id="`post-${index + 1}`">
        <div class="event-post-profileimage">
          <img :src="`${msfsForumsUrl}${post.avatar_template.replace('{size}', '50')}`" :alt="post.username">
        </div>
        <div class="event-post-username">{{ post.username }}</div>
        <div class="event-post-created">{{ formatDate(post.created_at) }}</div>
        <div class="event-post-index"># {{ index + 1 }} / {{ eventPosts.length }}</div>
        <p class="event-post-content" v-html="post.cooked"></p>
      </div>
    </div>

  </div>

  <Loading v-model:active="loading"
             :can-cancel="false"
             :enforce-focus="true"
             :lock-scroll="true"
             color="#0054A3"/>
</template>

<script>
import axios from 'axios';
import { shell, clipboard } from 'electron';
import BackgroundSlideshowComponent from '@/components/BackgroundSlideshowComponent.vue';
import Loading from 'vue3-loading-overlay';

import { addEventToGoogleCalendar } from '../shared/calendars.js'

export default {
  name: 'EventView',

  components: {
    // Loading,
    BackgroundSlideshowComponent,
    Loading,
  },

  data() {
    return {
      loading: false,
      msfsForumsUrl: 'https://forums.flightsimulator.com',

      eventUrl: this.$route.params.url,
      eventDetails: {},
      eventPosts: [],
    }
  },

  created() {
    document.title = 'Event Details | MSFS Events Calendar';

    axios.interceptors.request.use(config => {
        this.loading = true
        return config
    })

    axios.interceptors.response.use(response => {
        this.loading = false
        return response
    }, error => {
      this.loading = false
      return Promise.reject(error)
    })

    this.fetchEventDetails();
  },

  mounted() {
    document.addEventListener('click', this.handleLinkClick);
    document.addEventListener('mouseover', this.handleMouseOver);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleLinkClick);
    document.removeEventListener('mouseover', this.handleMouseOver);
  },

  methods: {
    fetchEventDetails() {
      this.$notify({
        title: 'Loading Events-Data',
        text: 'Please wait, while MSFS Events are loaded...',
        type: 'info',
        duration: 2000,
      });

      axios
        .get(`${this.eventUrl}.json`)
        .then(response => {
          this.eventDetails = response.data;
          this.eventPosts = response.data.post_stream.posts.filter(post => post.cooked && post.cooked.length > 0);

          this.$notify({
            title: 'Event Details Loaded',
            text: 'Events Details have been loaded successfully...',
            type: 'success',
            duration: 3000,
          });
        })
        .catch(error => {
          this.$notify({
            title: error.code,
            text: error.message,
            type: 'error',
          });
          console.error('Error fetching data:', error);
        })
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
      };
      return date.toLocaleDateString(undefined, options);
    },

    openEventInBrowser() {
      shell.openExternal(this.eventUrl);
    },

    saveToClipboard() {
      clipboard.writeText(this.eventUrl);

      this.$notify({
            title: 'Saved to Clipboard',
            text: 'The Event URL has been saved to the Clipboard...',
            type: 'info',
            duration: 3000,
      });
    },

    handleLinkClick(event) {
      // Check if the clicked element is an <a> tag
      if (event.target.tagName === 'A') {
        if(event.target.className == 'home-link') {
          return;
        }

        if(event.target.className == 'attachment') {
          event.preventDefault();
          shell.openExternal(this.msfsForumsUrl + event.target.href.replace(window.location.origin, ''));
          return
        }
        
        event.preventDefault();
        shell.openExternal(event.target.href);
      }
    },

    handleMouseOver(event) {
      if (event.target.tagName === 'A') {
        if(event.target.className == 'home-link') {
          return;
        }
        event.target.title = event.target.href;
      }
    },

    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },

    printPage() {
      window.print();
    },

    showCalendarPopup() {
      // ToDo: Show Popup; Add option for ICS-Files; Split functions
      const storedEventData = JSON.parse(localStorage.getItem('eventData')); // Parse the stored data from JSON
      const matchingEvent = storedEventData.find(event => event.id === this.eventDetails.id);

      console.log(matchingEvent)

      if (matchingEvent) {
        addEventToGoogleCalendar(matchingEvent);
      }
    },

  },
}
</script>
