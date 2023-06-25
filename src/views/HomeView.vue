<template>
  <BackgroundSlideshowComponent></BackgroundSlideshowComponent>

  <notifications position="bottom right" :pauseOnHover="true" :duration="5000" classes="notification-base" title="Click to close this notification..." />

  <div style="margin: 20px;">
    <h1 class="main-title">
      Microsoft Flight Simulator <br>
      Community Events
    </h1>

    <div class="toolbar-wrapper">
      <button class="refresh-button" @click="fetchEventData(true)" title="Reload Data...">
        <font-awesome-icon :icon="['fas', 'arrows-rotate']" />
      </button>
      <div class="datepicker-wrapper">
        <div class="datepicker-label">
          <h3>Select a Day</h3>
        </div>
        <div class="datepicker-input-wrapper">
          <a class="input-button" title="toggle" data-toggle>
            <font-awesome-icon :icon="['far', 'calendar-check']" />
          </a>
          <vue-flatpickr data-input v-model="selectedDate" @on-change="filterSelectedEventData" :config="flatpickrConfig" title="Choose a Day..."></vue-flatpickr>
        </div>
        <div class="today-button" @click="selectToday" title="Reset to today's date...">
          <font-awesome-icon :icon="['fas', 'clock-rotate-left']" /> Reset Day
        </div>
      </div>

      <div v-if="selectedDateEvents.length > 0" class="events-counter" style="color: #000;">
        {{ selectedDateEvents.length }} Events found
      </div>
    </div>

    <div>
      <div v-if="selectedDateEvents.length > 0" class="event-grid">
        <div v-for="event in selectedDateEvents" :key="event.id" class="event-card" @click="navigateToEvent(event.slug)" @contextmenu="onContextMenu($event, event)" :title="event.fancy_title">
          <h3 class="event-title" v-html="event.fancy_title"></h3>
          <div class="event-time">
            <font-awesome-icon :icon="['far', 'clock']" /> {{ formatTime(event.event.start) }}
            <span v-show="event.event.end"> - {{ formatTime(event.event.end) }}</span>
          </div>
          <img v-show="event.image_url" class="event-image" :src="event.image_url">
          <p class="event-description" v-html="event.excerpt.length > 210 ? event.excerpt.substring(0, 210) + '...' : event.excerpt"></p>
        </div>
      </div>
      <div v-else-if="selectedDateEvents.length == 0 && !loading">
        <h1>No Data</h1>
      </div>
    </div>

    <Loading v-model:active="loading"
             :can-cancel="false"
             :enforce-focus="true"
             :lock-scroll="true"
             color="#0054A3"/>
  </div>
</template>

<script>
import { shell, clipboard } from 'electron';
import { createEvent } from 'ics';
import axios from 'axios';
import Loading from 'vue3-loading-overlay';
import VueFlatpickr from 'vue-flatpickr-component';
import ContextMenu from '@imengyu/vue3-context-menu';
import BackgroundSlideshowComponent from '@/components/BackgroundSlideshowComponent.vue';


export default {
  name: "HomeView",

  components: {
    VueFlatpickr,
    Loading,
    BackgroundSlideshowComponent,
  },

  data() {
    return {
      msfsEventsUrl: 'https://forums.flightsimulator.com/t/',
      eventData: [],
      loading: true,
      error: null,

      selectedDate: new Date(),
      flatpickrConfig: {
        minDate: new Date(new Date().setDate(new Date().getDate() - 30)), // Set the minimum allowed date to 30 days in the past
        maxDate: null, // Set the maximum allowed date dynamically
        disable: [],
        dateFormat: 'D M d Y',
        defaultDate: 'today', // Initialize disable option as an empty array
        wrap: true,
        weekNumbers: true,
        monthSelectorType: 'static'
      },

      selectedDateEvents: [],
    };
  },

  computed: {
    currentBgImage() {
      return this.bgImages[this.currentBgIndex];
    },
    nextBgImage() {
      return this.bgImages[this.nextBgIndex];
    },
  },

  created() {
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

    document.title = "Home | MSFS Events Calendar";
  },

  mounted() {
    this.fetchEventData();

    window.addEventListener('mouseover', function(event) {
      if (event.target.classList.contains('mx-context-menu')) {
        event.target.addEventListener('mouseleave', function() {
          this.style.display = 'none';
        });
      }
    });

    window.addEventListener('touchstart', function(event) {
      if (event.target.classList.contains('mx-context-menu')) {
        event.target.addEventListener('touchend', function() {
          this.style.display = 'none';
        });
      }
    });
    
  },

  methods: {
    onContextMenu(e, event) {
      //prevent the browser's default menu
      e.preventDefault();
      //show your menu
      ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        items: [
          { 
            label: 'Open', 
            onClick: () => {
              this.navigateToEvent(event.slug);
            }
          },
          { 
            label: 'Open in Browser', 
            onClick: () => {
              this.openEventInBrowser(event.slug);
            }
          },
          { 
            label: "Share", 
              children: [
              { 
                label: "Copy Link",
                onClick: () => {
                  clipboard.writeText(`${this.msfsEventsUrl}${event.slug}`);
                }
              },
            ]
          },
          { 
            label: "Add to Calender", 
              children: [
              { 
                label: ".ics File",
                onClick: () => {
                  this.getICSFile(event);
                }
              },
              { 
                label: "Google Calender",
                onClick: () => {
                  this.addEventToGoogleCalendar(event);
                }
              },
            ]
          },
        ]
      });
    },

    fetchEventData(force = false) {
      // Check if cached data exists and is fresh
      const cachedData = localStorage.getItem('eventData');
      const cachedTimestamp = localStorage.getItem('eventDataTimestamp');
      const currentTime = new Date().getTime();
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

      if (cachedData && cachedTimestamp && !force && (currentTime - cachedTimestamp) < thirtyMinutes) {
        // Use cached data
        this.eventData = JSON.parse(cachedData);
        this.setMinMaxDates();
        this.setDisabledDates();
        this.filterSelectedEventData();
        
        this.loading = false;

        this.$notify({
          title: 'Event Details Loaded',
          text: 'Event details have been loaded from cache.',
          type: 'success',
          duration: 3000,
        });
      } else {
        // Fetch fresh data
        this.$notify({
          title: 'Loading Events-Data',
          text: 'Please wait, while MSFS Events are loaded...',
          type: 'info',
          duration: 2000,
        });

        axios
          .get('http://localhost:3002/api/calendar')
          .then(response => {
            const eventTopics = response.data.topic_list.topics;
            this.eventData = this.filterRecentEventData(eventTopics);
            this.setMinMaxDates();
            this.setDisabledDates();
            this.filterSelectedEventData();

            // Cache the data and timestamp in localStorage
            localStorage.setItem('eventData', JSON.stringify(this.eventData));
            localStorage.setItem('eventDataTimestamp', currentTime);

            this.$notify({
              title: 'Events Loaded',
              text: 'Events have been loaded successfully...',
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
          });
      }
    },

    filterRecentEventData(eventData) {
      const today = new Date();
      let pastMonth = new Date(today);
      pastMonth.setDate(pastMonth.getDate() - 30);
      pastMonth = pastMonth.toISOString().split('T')[0]; // Get 30 days in the past in the format 'YYYY-MM-DD'
      const filteredArray = eventData.filter(item => {
        const eventStartDate = item.event.start.split('T')[0];
        return eventStartDate >= pastMonth;
      });
      return filteredArray;
    },

    filterSelectedEventData() {
      let selectedDateString = this.selectedDate;
      if(typeof(selectedDateString) !== 'string') {
        selectedDateString = selectedDateString.toISOString().split('T')[0]
      } else {
        const selectedDateObject = new Date(selectedDateString);
        const year = selectedDateObject.getFullYear();
        const month = String(selectedDateObject.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDateObject.getDate()).padStart(2, '0');
        selectedDateString = `${year}-${month}-${day}`;
      }
      
      this.selectedDateEvents = this.eventData.filter(item => {
        const eventDate = item.event.start.split('T')[0];
        return eventDate === selectedDateString;
      });
    },

    setMinMaxDates() {
      if (this.eventData.length > 0) {
        const latestEvent = this.eventData[this.eventData.length - 1];
        this.flatpickrConfig.maxDate = new Date(latestEvent.event.start.split('T')[0]);
      }
    },

    setDisabledDates() {
      const disabledRanges = [];
      const eventDates = this.eventData.map((event) => new Date(event.event.start.split('T')[0]));
      eventDates.sort((a, b) => a - b); // Sort the event dates in ascending order

      if (eventDates.length > 0) {
        let fromDate = new Date(eventDates[0]);

        for (let i = 1; i < eventDates.length; i++) {
          const toDate = new Date(eventDates[i]);
          toDate.setDate(toDate.getDate() - 1); // Subtract one day from the event date

          if (fromDate < toDate) {
            disabledRanges.push(
              { 
                from: fromDate,
                to: toDate 
              });
          }

          fromDate = new Date(eventDates[i]);
        }
      }

      this.flatpickrConfig.disable = disabledRanges;
    },

    selectToday() {
      this.selectedDate = new Date();
    },

    formatTime(dateTime) {
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZoneName: 'short'
      };
      return new Date(dateTime).toLocaleTimeString([], options);
    },

    navigateToEvent(slug) {
      // window.open(`${this.msfsEventsUrl}${slug}`);
      this.$router.push({ name: 'EventView', params: { url: `${this.msfsEventsUrl}${slug}` } });
    },

    openEventInBrowser(slug) {
      shell.openExternal(`${this.msfsEventsUrl}${slug}`);
    },

    getICSFile(event) {
      const start = new Date(event.event.start);
      const startTime = [start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()];
      let endTime = null;
      if(event.event.end) {
        const end = new Date(event.event.end);
        endTime = [end.getFullYear(), end.getMonth(), end.getDate(), end.getHours(), end.getMinutes()]
      }

      const calenderEvent = {
        title: event.fancy_title,
        description: event.excerpt,
        location: 'Microsoft Flight Simulator',
        start: startTime,
        end: endTime != null ? endTime : startTime
      };

      const { error, value } = createEvent(calenderEvent);
      if (error) {
        console.error(error);
      } else {
        this.downloadICSFile(value, `${event.fancy_title}.ics`);
      }
    },

    downloadICSFile(content, filename) {
      const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    addEventToGoogleCalendar(event) {
      const formattedStart = this.convertToRFC5545Format(event.event.start);
      let formattedEnd = null;
      if(event.event.end) {
        formattedEnd = this.convertToRFC5545Format(event.event.end);
      }

      // Encode the event details
      const encodedTitle = encodeURIComponent(event.fancy_title);
      const encodedDescription = encodeURIComponent(event.excerpt);
      const encodedLocation = encodeURIComponent("Microsoft Flight Simulator");
      const encodedStart = encodeURIComponent(formattedStart);
      const encodedEnd = encodeURIComponent(formattedEnd != null ? formattedEnd : formattedStart);

      // Construct the URL with the encoded parameters
      const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDescription}&location=${encodedLocation}&dates=${encodedStart}/${encodedEnd}`;

      // Open the URL in a new tab or window
      shell.openExternal(url);
    },

    convertToRFC5545Format(dateTimeString) {
      const dateTime = new Date(dateTimeString);
      const formattedDateTime = dateTime
        .toISOString()
        .replace(/[:-]/g, '') // Remove hyphens and colons
        .replace('.000', 'Z'); // Replace milliseconds and add 'Z' for UTC

      return formattedDateTime;
    },

  },
};
</script>

<style lang="scss" scoped>
body {
  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE, Edge */
  scrollbar-width: none; /* Firefox */
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>