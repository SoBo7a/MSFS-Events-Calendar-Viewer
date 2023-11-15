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

  <div class="event-details-wrapper" @contextmenu="onContextMenu($event, event)">
    <router-link to="/" title="Go back to the Overview..." class="home-link menu-icon">
      <font-awesome-icon :icon="['fas', 'house-chimney']" title="Go back to the Overview..." />    
    </router-link>
    <font-awesome-icon class="menu-icon" :icon="['fas', 'arrows-rotate']" title="Refresh page contents..." :class="{ 'rotate': loading }" @click="fetchEventDetails()" />
    <font-awesome-icon class="menu-icon" :icon="['fab', 'chrome']" title="Open this Event in your Browser..." @click="openEventInBrowser()" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'link']" title="Copy the URL of this Event to your Clipboard..." @click="saveURLToClipboard()" />
    <!-- <font-awesome-icon class="menu-icon" :icon="['fas', 'file-pdf']" title="Save Event as PDF..." @click="printPage('pdf')" /> -->
    <font-awesome-icon class="menu-icon" :icon="['fas', 'print']" title="Print the current page..." @click="printPage('print')" />
    <font-awesome-icon class="menu-icon" :icon="['fas', 'calendar-days']" title="Add Event to Calendar..." @click="showCalendarPopup()" />
    <ModalComponent v-model:show-modal="showModal" @option-selected="handleCalendarOptionSelected" />

    <div class="event-details">
      <h1 class="event-details-title" v-html="eventDetails.fancy_title"></h1>

      <div class="event-details-date" title="Event Date">
        <font-awesome-icon :icon="['far', 'clock']" /> {{ eventStartTime }}{{eventEndTime ?  ` - ${eventEndTime}` : '' }}
      </div>

      <div v-show="filteredInvitees.length !== 0">
        <div class="invitee-counter">{{ goingCount }} Going - {{ interestedCount }} Interested - {{ notGoingCount }} Not Going</div>
        <div class="invitees">
          <div v-for="invitee in filteredInvitees.slice(0, calculateAvatarCount())" :key="invitee.id" class="invitee-avatar">
            <a class="invitee-avatar-link" :href="`${msfsForumsUrl}/u/${invitee.user.username}`" :title="`Click to visit ${invitee.user.username}'s profile in the Browser`" >
              <img
                class="invitee-avatar-img"
                :src="`${msfsForumsUrl}${invitee.user.avatar_template.replace('{size}', '50')}`"
                :alt="invitee.user.username"
                :style="{ borderColor: getAvatarBorderColor(invitee.status) }"
              />
            </a>
          </div>
          <button class="show-all-button" @click="showAllInvitees">Show All</button>
        </div>
      </div>
      <InviteeModalComponent
        v-if="showInviteeModal"
        :goingInvitees="goingInvitees"
        :interestedInvitees="interestedInvitees"
        :notGoingInvitees="notGoingInvitees"
        @close="closeInviteeModal"
      />

      <div class="event-posts-container">
        <div v-for="(post, index) in eventPosts" :key="post.id" class="event-post" :id="`post-${index + 1}`">
          <div class="event-post-profileimage" :title="`Click to visit ${post.username}'s profile in the Browser`">
            <img class="profile-image" :src="`${msfsForumsUrl}${post.avatar_template.replace('{size}', '50')}`" :alt="post.username">
          </div>
          <div class="event-post-username">{{ post.username }}</div>
          <div class="event-post-created">{{ formatDate(post.created_at) }}</div>
          <div class="event-post-index"># {{ index + 1 }} / {{ eventPosts.length }}</div>
          <p class="event-post-content" v-html="post.cooked"></p>
        </div>
      </div>
    </div>
  </div>

  <font-awesome-icon v-show="!scrolledToTop" class="scroll-up-button" :icon="['fas', 'arrow-up']" title="Scroll to the top..." @click="scrollToTop()" />

  <ScrollBarComponent :content-ready="!loading" ></ScrollBarComponent>

  <Loading v-model:active="loading"
             :can-cancel="false"
             :enforce-focus="true"
             :lock-scroll="true"
             color="#0054A3"/>
</template>

<script>
import { h } from 'vue';
import axios from 'axios';
import { shell, clipboard } from 'electron';
import ContextMenu from '@imengyu/vue3-context-menu';
import ModalComponent from '@/components/CalendarModalComponent.vue';
import ScrollBarComponent from '@/components/ScrollBarComponent.vue'
import InviteeModalComponent from '@/components/InviteeModalComponent.vue';
import Loading from 'vue3-loading-overlay';
import { addEventToGoogleCalendar, getICSFile } from '../shared/calendars.js'
import { FontAwesomeIcon, iconObj } from '../shared/fontawesome-icons'
import scrollMixin from '../shared/mixins/scroll-up-mixin';


export default {
  name: 'EventView',
  mixins: [scrollMixin],

  components: {
    ModalComponent,
    Loading,
    ScrollBarComponent,
    InviteeModalComponent,
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

      showInviteeModal: false,
      goingInvitees: [],
      interestedInvitees: [],
      notGoingInvitees: [],
    }
  },

  computed: {
    filteredInvitees() {
      const posts = this.eventDetails.post_stream?.posts;

      if (!posts || posts.length === 0 || !posts[0].event) {
        return [];
      }

      const goingInvitees = posts[0].event.sample_invitees.filter(invitee => invitee.status === 'going');
      const interestedInvitees = posts[0].event.sample_invitees.filter(invitee => invitee.status === 'interested');
      const notGoingInvitees = posts[0].event.sample_invitees.filter(invitee => invitee.status === 'not_going');

      return [...goingInvitees, ...interestedInvitees, ...notGoingInvitees];
    },

    goingCount() {
      return this.filteredInvitees.filter(invitee => invitee.status === 'going').length;
    },

    interestedCount() {
      return this.filteredInvitees.filter(invitee => invitee.status === 'interested').length;
    },
    
    notGoingCount() {
      return this.filteredInvitees.filter(invitee => invitee.status === 'not_going').length;
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

    this.fetchEventDetails();
  },

  mounted() {
    document.title = 'Event Details | MSFS Events Calendar Viewer';

    document.addEventListener('click', this.handleLinkClick);
    document.addEventListener('mouseover', this.handleMouseOver);

    window.addEventListener('resize', this.handleResize);

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

    window.removeEventListener('resize', this.handleResize);

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
          console.log(response.data)
          this.eventDetails = response.data;
          this.eventPosts = response.data.post_stream.posts.filter(post => post.cooked && post.cooked.length > 0);
          this.eventStartTime =this.formatDate(this.eventDetails.event_starts_at + "Z");

          if(this.eventDetails.event_ends_at) {
            this.eventEndTime = this.formatDate(this.eventDetails.event_ends_at + "Z");
          }

          // Modify Twitch Iframes
          this.eventPosts.forEach(post => {
            if (post.cooked.includes('iframe src="https://player.twitch.tv')) {
              post.cooked = post.cooked.replace('parent=forums.flightsimulator.com', 'parent=localhost');
            }
          });          
        })
        .catch(error => {
          this.$notify({
            title: error.code,
            text: error.message,
            type: 'error',
          });
          // eslint-disable-next-line
          console.error('Error fetching data:', error);
        })
    },

    onContextMenu(e) {
      //prevent the browser's default menu
      e.preventDefault();
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
            type: 'success',
            duration: 3000,
      });
    },

    getAvatarBorderColor(status) {
      // Set border color based on the invitee's status
      switch (status) {
        case 'going':
          return 'green';
        case 'interested':
          return 'yellow';
        case 'not_going':
          return 'red';
        default:
          return 'transparent';
      }
    },

    calculateAvatarCount() {
      const containerWidth = window.innerWidth;
      const avatarWidth = 88;

      // Calculate the maximum number of avatars that can fit in the container
      let maxAvatars = Math.max(Math.floor(containerWidth / avatarWidth), 7);
      // Return the minimum of maxAvatars and the total number of avatars
      return Math.min(maxAvatars, this.filteredInvitees.length);
    },

    showAllInvitees() {
      // Populate goingInvitees, interestedInvitees, notGoingInvitees based on your logic
      // For example, you can filter invitees based on their status

      // Assuming your eventDetails object has information about invitees
      const posts = this.eventDetails.post_stream?.posts;

      if (!posts || posts.length === 0 || !posts[0].event) {
        return;
      }

      const invitees = posts[0].event.sample_invitees;

      // Assuming sample_invitees structure:
      // [{ status: 'going', user: { username: 'John', avatar_template: '/path/to/avatar' } }, ...]

      // Clear previous data
      this.goingInvitees = [];
      this.interestedInvitees = [];
      this.notGoingInvitees = [];

      // Separate invitees based on status
      invitees.forEach(invitee => {
        if (invitee.status === 'going') {
          this.goingInvitees.push(invitee);
        } else if (invitee.status === 'interested') {
          this.interestedInvitees.push(invitee);
        } else if (invitee.status === 'not_going') {
          this.notGoingInvitees.push(invitee);
        }
      });

      // Set showInviteeModal to true to display the modal
      this.showInviteeModal = true;
    },

    closeInviteeModal() {
      // Close the modal when the user clicks the close button
      this.showInviteeModal = false;
    },

    handleResize() {
      this.$forceUpdate(); 
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

      if (event.target.className === 'offline-embeds--stylized-link') {
          const parentEl = event.target.parentElement;
          const href = parentEl.href;
          event.preventDefault();
          shell.openExternal(href);
      }

      if (event.target.tagName ==='IMG' && event.target.className !== 'event-image' && event.target.className !== 'invitee-avatar-img' && event.target.className !== 'modal-avatar-image' && event.target.className !== 'profile-image') {
        event.target.title = 'Click to open the Image in your Browser.'
        const href = event.target.src;
        event.preventDefault();
        shell.openExternal(href);
      }

      if (event.target.className === 'profile-image') {
        const userName = event.target.alt;
        const profileUrl = `${this.msfsForumsUrl}/u/${userName}`;
        event.preventDefault();
        shell.openExternal(profileUrl);
      }

      if (event.target.className === 'invitee-avatar-img' && event.target.className === 'modal-avatar-image') {
        const parentEl = event.target.parentElement;
        const href = parentEl.href;
        event.preventDefault();
        shell.openExternal(href);
      }
    },

    handleMouseOver(event) {
      if (event.target.tagName === 'A') {
        if(event.target.className === 'home-link' || event.target.className === 'invitee-avatar-link') {
          return;
        }
        event.target.title = event.target.href;
      }

      if (event.target.tagName ==='IMG' && event.target.className !== 'event-image' && event.target.className !== 'invitee-avatar-img' && event.target.className !== 'modal-avatar-image' && event.target.className !== 'profile-image') {
        event.target.title = 'Click to open the Image in your Browser.'
      }
    },

    // ToDo: Create "convert to PDF" feature
    printPage() {
      if (window && window.require) {
        const { remote } = window.require('electron');
        const { BrowserWindow } = remote;

        const printWindow = new BrowserWindow({ show: false });

        printWindow.webContents.on('did-finish-load', () => {
          printWindow.webContents.print({}, () => {
            printWindow.close();
          });
        });

        const printContent = document.querySelector('.event-details').cloneNode(true);
        const images = printContent.querySelectorAll('img');
        const iframes = printContent.querySelectorAll('iframe');
        const links = printContent.querySelectorAll('a');

        for (const image of images) {
          image.remove();
        }
        for (const iframe of iframes) {
          iframe.remove();
        }
        for (const link of links) {
          link.remove();
        }

        let stylesHtml = '';
        const headStyles = document.head.querySelectorAll('link[rel="stylesheet"], style');

        for (const node of headStyles) {
          stylesHtml += node.outerHTML;
        }

        printWindow.loadURL('data:text/html,' + encodeURIComponent(`<html><head><meta charset="UTF-8">${stylesHtml}<title>Print Event Details</title></head><body><div class="print-view">` + printContent.innerHTML + '</div></body></html>'));
      } else {
        console.error("Cannot print in this environment. This is not an Electron app.");
      }
    },

    showCalendarPopup() {
      this.showModal = true;
    },

    handleCalendarOptionSelected(option) {
      const storedEventData = JSON.parse(localStorage.getItem('eventData')); 
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
