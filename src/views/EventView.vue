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
  <BackgroundSlideshowComponent></BackgroundSlideshowComponent>

  <notifications position="bottom right" :pauseOnHover="true" :duration="5000" classes="notification-base" title="Click to close this notification..." />

  <div class="event-details-wrapper" @contextmenu="onContextMenu($event, event)">
    <router-link to="/" title="Go back to the Overview..." class="home-link menu-icon">
      <font-awesome-icon :icon="['fas', 'house-chimney']" title="Go back to the Overview..." />    
    </router-link>
    <font-awesome-icon class="menu-icon" :icon="['fas', 'arrows-rotate']" title="Refresh page contents..." @click="fetchEventDetails()" />
    <font-awesome-icon class="menu-icon" :icon="['fab', 'chrome']" title="Open this Event in your Browser..." @click="openEventInBrowser()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'link']" title="Copy the URL of this Event to your Clipboard..." @click="saveURLToClipboard()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'print']" title="Print the current page..." @click="printPage()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'calendar-days']" title="Add Event to Calendar..." @click="showCalendarPopup()" />
    <ModalComponent v-model:show-modal="showModal" @option-selected="handleCalendarOptionSelected" />

    <font-awesome-icon v-show="!scrolledToTop" class="menu-icon" :icon="['fas', 'arrow-up']" title="Scroll to the top..." @click="scrollToTop()" />

    <h1 class="event-details-title" v-html="eventDetails.fancy_title"></h1>

    <div class="event-details-date">
      {{ eventStartTime }}{{eventEndTime ?  ` - ${eventEndTime}` : '' }}
    </div>

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

  <ScrollBarComponent :content-ready="!loading" ></ScrollBarComponent>

  <Loading v-model:active="loading"
             :can-cancel="false"
             :enforce-focus="true"
             :lock-scroll="true"
             color="#0054A3"/>
</template>

<script>
import axios from 'axios';
import { shell, clipboard } from 'electron';
import ContextMenu from '@imengyu/vue3-context-menu';
import BackgroundSlideshowComponent from '@/components/BackgroundSlideshowComponent.vue';
import ModalComponent from '@/components/CalendarModalComponent.vue';
import ScrollBarComponent from '@/components/ScrollBarComponent.vue'

import Loading from 'vue3-loading-overlay';

import { addEventToGoogleCalendar, getICSFile } from '../shared/calendars.js'

import { h } from 'vue';
import { FontAwesomeIcon, iconObj } from '../shared/fontawesome-icons'


export default {
  name: 'EventView',

  components: {
    BackgroundSlideshowComponent,
    ModalComponent,
    Loading,
    ScrollBarComponent,
  },

  data() {
    return {
      loading: false,
      showModal: false,
      msfsForumsUrl: 'https://forums.flightsimulator.com',

      eventUrl: this.$route.params.url,
      eventDetails: {},
      eventPosts: [],
      eventStartTime: null,
      eventEndTime: null,

      scrolledToTop: true,
    }
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

    this.fetchEventDetails();
  },

  mounted() {
    document.title = 'Event Details | MSFS Events Calendar Viewer';

    document.addEventListener('click', this.handleLinkClick);
    document.addEventListener('mouseover', this.handleMouseOver);

    // EventListener to show/hide to scroll up button
    window.addEventListener('mousewheel', () => {
      this.scrolledToTop = window.scrollY === 0 ? true : false;
    });
    window.addEventListener('mouseup', () => {
      setTimeout(() => {
        this.scrolledToTop = window.scrollY <= 3 ? true : false;
      }, 1000);
    });

    // Use MutationObserver to check if iframe present in the DOM and add handleLinkClick Eventlistener
    const observer = new MutationObserver(() => {
      const iframes = document.querySelectorAll('iframe');
      if (iframes.length > 0) {
        iframes.forEach((iframe) => {
          iframe.contentWindow.addEventListener('click', this.handleLinkClick);
        });
        // Disconnect the observer once the desired elements are found
        observer.disconnect();
      }
    });

    // Start observing changes in the DOM
    observer.observe(document.body, { childList: true, subtree: true });
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
          this.eventStartTime =this.formatDate(this.eventDetails.event.start);

          if(this.eventDetails.event.end) {
            this.eventEndTime = this.formatDate(this.eventDetails.event.end);
          }

          // Modify Twitch Iframes
          this.eventPosts.forEach(post => {
            if (post.cooked.includes('iframe src="https://player.twitch.tv')) {
              post.cooked = post.cooked.replace('parent=forums.flightsimulator.com', 'parent=localhost');
            }
          });

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

    onContextMenu(e) {
      //prevent the browser's default menu
      e.preventDefault();
      //show your menu
      const rootElement = document.documentElement;

      ContextMenu.showContextMenu({
        x: e.x,
        y: e.y,
        theme: rootElement.classList.contains('dark-mode') ? 'default dark' : 'default',
        items: [
          { 
            label: 'Copy selection', 
            onClick: () => {
              this.copySelectedToClipboard(e);
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faCopy,
            })
          },
          { 
            label: 'Refresh',
            onClick: () => {
              this.fetchEventDetails();
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faArrowsRotate,
            })
          },
          { 
            label: 'Open in Browser', 
            onClick: () => {
              this.openEventInBrowser();
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faChrome,
            })
          },
          { 
            label: 'Copy Event URL', 
            onClick: () => {
              this.saveURLToClipboard();
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faLink,
            })
          },
          { 
            label: 'Print', 
            onClick: () => {
              this.printPage();
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faPrint,
            })
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
                  this.handleCalendarOptionSelected('ics');
                },
                icon: h(FontAwesomeIcon, {
                  icon: iconObj.faCalendarPlus,
                }),
              },
              { 
                label: "Google Calender",
                onClick: () => {
                  this.handleCalendarOptionSelected('google');
                },
                icon: h(FontAwesomeIcon, {
                  icon: iconObj.faGoogle,
                }),
              },
            ]
          },
          { 
            label: 'Back to Overview', 
            onClick: () => {
              this.$router.push('/');
            },
            icon: h(FontAwesomeIcon, {
              icon: iconObj.faHouseChimney,
            })
          },
        ]
      });
    },

    copySelectedToClipboard(event) {
      const selectedText = window.getSelection().toString();
      const target = event.target;

      if (target.tagName === 'A') {
        const linkHref = target.href;

        if (selectedText) {
          navigator.clipboard.writeText(selectedText)
            .then(() => {
              console.log('Selected Text:', selectedText);
            })
            .catch((error) => {
              this.$notify({
                title: 'ERROR',
                text: error,
                type: 'error',
                duration: 5000,
              });
            });
        } else {
          navigator.clipboard.writeText(linkHref)
            .then(() => {
              this.$notify({
                title: 'URL copied',
                text: 'URL has been copied to the clipboard.',
                type: 'success',
                duration: 2000,
              });
            })
            .catch((error) => {
              this.$notify({
                title: 'ERROR',
                text: error,
                type: 'error',
                duration: 5000,
              });
            });
        }
      } else if (target.tagName === 'IMG') {
        const imageUrl = target.src;

        navigator.clipboard.writeText(imageUrl)
          .then(() => {
            this.$notify({
              title: 'Image URL copied',
              text: 'Image URL has been copied to the clipboard.',
              type: 'success',
              duration: 2000,
            });
          })
          .catch((error) => {
            this.$notify({
              title: 'ERROR',
              text: error,
              type: 'error',
              duration: 5000,
            });
          });
      } else if (selectedText) {
        navigator.clipboard.writeText(selectedText)
          .then(() => {
            this.$notify({
              title: 'Text copied',
              text: 'Selected Text has been copied to the clipboard.',
              type: 'success',
              duration: 2000,
            });
          })
          .catch((error) => {
            this.$notify({
              title: 'ERROR',
              text: error,
              type: 'error',
              duration: 5000,
            });
          });
      } else {
        this.$notify({
          title: 'ERROR',
          text: 'Nothing to copy...',
          type: 'error',
          duration: 2000,
        });
      }
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

    saveURLToClipboard() {
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
        // "offline-embeds--stylized-link" for twitch iframe links
      if (event.target.tagName === 'A') {
        if(event.target.className == 'home-link') {
          return;
        }

        if(event.target.className == 'auto-clicked-link') {
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

      if(event.target.className === 'offline-embeds--stylized-link') {
          const parentEl = event.target.parentElement;
          const href = parentEl.href;
          event.preventDefault();
          shell.openExternal(href);
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

      setTimeout(() => {
        this.scrolledToTop = true;
      }, 1000);
    },

    printPage() {
      window.print();
    },

    showCalendarPopup() {
      this.showModal = true;
    },

    handleCalendarOptionSelected(option) {
      const storedEventData = JSON.parse(localStorage.getItem('eventData')); // Parse the stored data from JSON
      const matchingEvent = storedEventData.find(event => event.id === this.eventDetails.id);

      if (matchingEvent) {
        if(option == 'google') {
            addEventToGoogleCalendar(matchingEvent);
        }

        if(option == 'ics') {
            getICSFile(matchingEvent);
        }
      }
      
    },

  },
}
</script>
