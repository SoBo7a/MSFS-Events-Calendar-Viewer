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
  <notifications position="bottom right" :pauseOnHover="true" :duration="5000" classes="notification-base" title="Click to close this notification..." />

  <div style="margin: 20px; margin-top: 45px;">
    <h1 class="main-title">
      Microsoft Flight Simulator <br>
      Community Events
    </h1>

    <div class="toolbar-wrapper">
      <button class="refresh-button" @click="fetchEventData(true)" title="Reload Data...">
        <font-awesome-icon :icon="['fas', 'arrows-rotate']" :class="{ 'rotate': loading }" />
      </button>
      <div class="datepicker-wrapper">
        <div class="datepicker-label">
          <h3>Select a Day</h3>
        </div>
        <div class="datepicker-input-wrapper">
          <a class="input-button" title="toggle" data-toggle>
            <font-awesome-icon :icon="['far', 'calendar-check']" title="Open Calendar" />
          </a>
          <vue-flatpickr data-input v-model="selectedDate" @on-change="filterSelectedEventData" :config="flatpickrConfig" title="Open Calendar"></vue-flatpickr>
        </div>
        <div class="datepicker-below-menu">
          <a class="prev-day-button" title="Previous available day" @click="selectDay('prev')">
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </a>
          <div class="today-button" @click="selectToday" title="Reset to today's date...">
            <font-awesome-icon :icon="['fas', 'calendar-day']" /> Reset Day
          </div>
          <a class="next-day-button" title="Next available day" @click="selectDay('next')">
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </a>
        </div>
      </div>

      <div v-if="selectedDateEvents.length > 0" class="events-counter" title="Count of Events for the selected Day">
        {{ selectedDateEvents.length }} Events found
      </div>

      <div v-if="showTimeSinceRefresh" class="events-time-since-refresh" title="Time since last reload">
        <font-awesome-icon :icon="['fas', 'clock-rotate-left']" /> {{ formattedTimeSinceRefresh }}
      </div>
    </div>

    <div>
      <div v-if="selectedDateEvents.length > 0" class="event-grid">
        <div v-for="event in selectedDateEvents" :key="event.id" :class="['event-card', getEventCardClass(event)]" @click="navigateToEvent(event.slug)" @contextmenu="onContextMenu($event, event)" :title="event.fancy_title">
          <h3 class="event-title" v-html="event.fancy_title"></h3>
          <div class="event-time">
            <font-awesome-icon :icon="['far', 'clock']" /> {{ formatTime(event.event_starts_at) }}
            <span v-show="event.event_ends_at"> - {{ formatTime(event.event_ends_at) }}</span>
          </div>
          <img v-show="event.image_url" class="event-image" :src="event.image_url" loading="lazy">
          <p class="event-description" v-html="event.excerpt.length > 210 ? event.excerpt.substring(0, 210) + '...' : event.excerpt"></p>
        </div>
      </div>
      <div v-else-if="selectedDateEvents.length == 0 && !loading">
        <h1>No Data</h1>
      </div>
    </div>

    <font-awesome-icon v-show="!scrolledToTop" class="scroll-up-button" :icon="['fas', 'arrow-up']" title="Scroll to the top..." @click="scrollToTop()" />

    <ScrollBarComponent :content-ready="!loading" ></ScrollBarComponent>

    <Loading v-model:active="loading"
             :can-cancel="false"
             :enforce-focus="true"
             :lock-scroll="true"
             color="#0054A3"/>
  </div>
</template>

<script>
import { h } from 'vue';
import { shell, clipboard } from 'electron';
import axios from 'axios';
import Loading from 'vue3-loading-overlay';
import VueFlatpickr from 'vue-flatpickr-component';
import ContextMenu from '@imengyu/vue3-context-menu';
import ScrollBarComponent from '@/components/ScrollBarComponent.vue';
import { getICSFile, addEventToGoogleCalendar } from '../shared/calendars.js';
import { FontAwesomeIcon, iconObj } from '../shared/fontawesome-icons'
import scrollMixin from '../shared/mixins/scroll-up-mixin';


export default {
  name: "HomeView",
  mixins: [scrollMixin],

  components: {
    VueFlatpickr,
    Loading,
    ScrollBarComponent,
  },

  data() {
    return {
      eventsCalendarJsonURL: 'https://forums.flightsimulator.com/c/msfs/community-fly-in-events/143.json',
      msfsEventsUrl: 'https://forums.flightsimulator.com/t/',
      eventData: [],
      loading: true,
      error: null,

      selectedDate: new Date().toUTCString(),
      flatpickrConfig: {
        minDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        maxDate: null,
        disable: [],
        dateFormat: 'D M d Y',
        wrap: true,
        weekNumbers: true,
        monthSelectorType: 'static'
      },

      selectedDateEvents: [],

      timeSinceRefresh: ''
    };
  },

  computed: {
    currentBgImage() {
      return this.bgImages[this.currentBgIndex];
    },
    nextBgImage() {
      return this.bgImages[this.nextBgIndex];
    },

    showTimeSinceRefresh() {
      return localStorage.getItem('eventDataTimestamp') !== null;
    },
    formattedTimeSinceRefresh() {
      return this.formatTimeDuration(this.timeSinceRefresh);
    },

    storedDate: {
      get() {
        return this.$store.getters.selectedDate;
      }
    },
  },

  watch: {
    selectedDate(newDate) {
      if (newDate !== null) {
        this.$store.dispatch('updateSelectedDate', newDate);
      }
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
  },

  mounted() {
    document.title = "Home | MSFS Events Calendar Viewer";

    this.getDateFromStore();

    this.fetchEventData();

    this.updateTimeSinceRefresh();
    setInterval(this.updateTimeSinceRefresh, 1000);

    window.addEventListener('mouseover', function(event) {
      if (event.target.classList.contains('mx-context-menu')) {
        let timeoutId;

        event.target.addEventListener('mouseleave', function() {
          timeoutId = setTimeout(() => {
            this.style.display = 'none';
          }, 800);
        });

        event.target.addEventListener('mouseenter', function() {
          clearTimeout(timeoutId);
        });
      }
    });    
  },

  methods: {
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
      } else {
        // Fetch fresh data
        this.$notify({
          title: 'Loading Events-Data',
          text: 'Please wait, while MSFS Events are loaded...',
          type: 'info',
          duration: 2000,
        });

        axios
          .get(this.eventsCalendarJsonURL)
          .then(response => {
            const eventTopics = response.data.topic_list.topics;
            this.eventData = this.filterRecentEventData(eventTopics.filter(event => Object.prototype.hasOwnProperty.call(event, 'event_starts_at')));
            // this.eventData = this.filterRecentEventData(eventTopics);
            this.setMinMaxDates();
            this.setDisabledDates();
            this.filterSelectedEventData();

            // Cache the data and timestamp in localStorage
            localStorage.setItem('eventData', JSON.stringify(this.eventData));
            localStorage.setItem('eventDataTimestamp', currentTime);
          })
          .catch(error => {
            this.$notify({
              title: error.code,
              text: error.message,
              type: 'error',
            });
            // eslint-disable-next-line
            console.error('Error fetching data:', error);
          });
      }
    },

    onContextMenu(e, event) {
      //prevent the browser's default menu
      e.preventDefault();
      const rootElement = document.documentElement;

      ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        theme: rootElement.classList.contains('dark-mode') ? 'default dark' : 'default',
        items: [
          { 
            label: 'Open', 
            onClick: () => {
              this.navigateToEvent(event.slug);
            }
            ,
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faDoorOpen,
            })
          },
          { 
            label: 'Open in Browser', 
            onClick: () => {
              this.openEventInBrowser(event.slug);
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faChrome,
            })
          },
          { 
            label: "Share", 
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faShareNodes,
            }),
            children: [
              { 
                label: "Copy Link",
                onClick: () => {
                  clipboard.writeText(`${this.msfsEventsUrl}${event.slug}`);
                  this.$notify({
                    title: 'Event URL copied',
                    text: 'URL of the selected Event has been copied to the clipboard.',
                    type: 'success',
                    duration: 2000,
                  });
                },
                icon: h(FontAwesomeIcon, {
                  icon: iconObj.faCopy,
                })
              },
            ]
          },
          { 
            label: "Add to Calender", 
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faCalendarDays,
            }),
            children: [
              { 
                label: ".ics File",
                onClick: () => {
                  getICSFile(event);
                },
                icon: h(FontAwesomeIcon, {
                  icon: iconObj.faCalendarPlus,
                })
              },
              { 
                label: "Google Calender",
                onClick: () => {
                  addEventToGoogleCalendar(event);
                },
                icon: h(FontAwesomeIcon, {
                  icon: iconObj.faGoogle,
                })
              },
            ]
          },
        ]
      });
    },

    filterRecentEventData(eventData) {
      const today = new Date();
      let pastMonth = new Date(today);
      pastMonth.setDate(pastMonth.getDate() - 30);
      pastMonth = pastMonth.toISOString().split(' ')[0]; // Get 30 days in the past in the format 'YYYY-MM-DD'
      const filteredArray = eventData.filter(item => {
        const eventStartDate = item.event_starts_at.split(' ')[0];
        return eventStartDate >= pastMonth;
      });
      return filteredArray;
    },

    filterSelectedEventData() {
      let selectedDateString = this.selectedDate;
      if(typeof(selectedDateString) !== 'string') {
        selectedDateString = selectedDateString.toISOString().split(' ')[0]
      } else {
        const selectedDateObject = new Date(selectedDateString);
        const year = selectedDateObject.getFullYear();
        const month = String(selectedDateObject.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDateObject.getDate()).padStart(2, '0');
        selectedDateString = `${year}-${month}-${day}`;
      }
      
      this.selectedDateEvents = this.eventData.filter(item => {
        const eventDate = item.event_starts_at.split(' ')[0];
        return eventDate === selectedDateString;
      });
    },

    getDateFromStore() {
      const savedSelectedDate = this.$store.getters.selectedDate;
      if (savedSelectedDate) {
        this.selectedDate = this.storedDate;
      }
    },

    setMinMaxDates() {
      if (this.eventData.length > 0) {
        const latestEvent = this.eventData[this.eventData.length - 1];
        this.flatpickrConfig.maxDate = new Date(latestEvent.event_starts_at.split(' ')[0]);
      }
    },

    setDisabledDates() {
      const disabledRanges = [];
      const eventDates = this.eventData.map((event) => new Date(event.event_starts_at.split(' ')[0]));
      eventDates.sort((a, b) => a - b);

      if (eventDates.length > 1) {
        let fromDate = new Date(eventDates[0]);

        for (let i = 1; i < eventDates.length; i++) {
          const toDate = new Date(eventDates[i]);
          toDate.setDate(toDate.getDate() - 1);

          if (fromDate < toDate) {
            disabledRanges.push(
              { 
                from: fromDate,
                to: toDate 
              });
          }

          fromDate = new Date(eventDates[i]);
        }
      } else if (eventDates.length === 1) {
        const today = new Date();
        const fromDate = new Date(eventDates[0]);
        fromDate.setDate(fromDate.getDate() - 30);
        const toDate = new Date(Math.max(today, eventDates[0]));
        toDate.setDate(toDate.getDate() - 1); 
        disabledRanges.push(
          { 
            from: fromDate,
            to: toDate 
          });
      }

      this.flatpickrConfig.disable = disabledRanges;
    },
    
    // FixMe: triggering this function empties the flatpickr input (this.selectedDate gets "null")
    selectToday() {
      if (this.selectedDate !== null) {
        this.selectedDate = this.storedDate
        return
      }

      this.selectedDate = new Date().toUTCString();
    },

    selectDay(direction) {
      let date = new Date(this.selectedDate);
      
      if (direction === 'next') {
        date.setDate(date.getDate() + 1);
      } else if (direction === 'prev') {
        date.setDate(date.getDate() - 1);
      }

      while (this.isDateDisabled(date)) {
        if (direction === 'next') {
          date.setDate(date.getDate() + 1);
        } else if (direction === 'prev') {
          date.setDate(date.getDate() - 1);
        }
      }

      if (!this.isDateOutOfRange(date)) {
        this.selectedDate = date.toUTCString();
      } else {
        this.$notify({
          title: 'No Data',
          text: 'No events data found...',
          type: 'info',
          duration: 2000,
        });
      }
    },
    
    isDateDisabled(date) {
      return this.flatpickrConfig.disable.some((range) => {
        return date >= range.from && date <= range.to;
      });
    },

    isDateOutOfRange(date) {
      const { minDate, maxDate } = this.flatpickrConfig;
      return (minDate && date < minDate) || (maxDate && date > maxDate);
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

    formatTimeDuration(duration) {
      const seconds = Math.floor(duration / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        return `${days} days`;
      } else if (hours > 0) {
        return `${hours} hours`;
      } else if (minutes > 0) {
        return `${minutes} minutes`;
      } else {
        return `${seconds} seconds`;
      }
    },

    updateTimeSinceRefresh() {
      const timestamp = localStorage.getItem('eventDataTimestamp');
      if (timestamp) {
        const currentTime = new Date().getTime();
        const lastRefreshTime = new Date(Number(timestamp));
        const timeDifference = currentTime - lastRefreshTime;
        this.timeSinceRefresh = timeDifference;
      }
    },

    getEventCardClass(event) {
      const currentTime = new Date().getTime();
      const eventStartTime = new Date(event.event_starts_at).getTime();
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

      if (eventStartTime < currentTime) {
        return 'event-past';
      } else if (eventStartTime - currentTime < twoHours) {
        return 'event-close';
      } else {
        return 'event-upcoming';
      }
    },

    navigateToEvent(slug) {
      // window.open(`${this.msfsEventsUrl}${slug}`);
      this.$router.push({ name: 'EventView', params: { url: `${this.msfsEventsUrl}${slug}` } });
    },

    openEventInBrowser(slug) {
      shell.openExternal(`${this.msfsEventsUrl}${slug}`);
    },

  },
};
</script>