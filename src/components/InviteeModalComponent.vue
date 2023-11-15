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
  <div class="invitee-modal">
    <div class="invitee-modal-overlay" @click="closeModal"></div>
    <div class="invitee-modal-content">
      <h2>Invitee Overview <span @click="closeModal" class="close-button">
        <font-awesome-icon :icon="['fas', 'circle-xmark']" class="fa-icon" />
      </span></h2>

      <!-- Search Bar -->
      <input class="invitee-searchbar" v-model="searchQuery" placeholder="Search invitees" />

      <!-- Category Buttons -->
      <div class="invitee-category-buttons">
        <button
          @click="showCategory('going')"
          :class="{ active: selectedCategory === 'going' }"
        >
          Going
        </button>
        <button
          @click="showCategory('interested')"
          :class="{ active: selectedCategory === 'interested' }"
        >
          Interested
        </button>
        <button
          @click="showCategory('notGoing')"
          :class="{ active: selectedCategory === 'notGoing' }"
        >
          Not Going
        </button>
      </div>

      <!-- Invitees List -->
      <div>
        <div class="no-invitee-data" v-if="filteredInvitees.length === 0">No invitees found!</div>
        <div v-else>
          <ul>
            <li v-for="invitee in filteredInvitees" :key="invitee.id">
              <!-- Make the username a clickable link -->
              <a class="invitee-avatar-link" :href="getUserProfileUrl(invitee.user)" target="_blank" :title="`Click to visit ${invitee.user.username}'s profile in the Browser`">
                <!-- Show avatar image before the name -->
                <img
                  v-if="invitee.user.avatar_template"
                  :src="
                    msfsForumsUrl + invitee.user.avatar_template.replace('{size}', '50')
                  "
                  alt="Avatar"
                  class="modal-avatar-image"
                />
                {{ invitee.user.username }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    goingInvitees: Array,
    interestedInvitees: Array,
    notGoingInvitees: Array,
  },

  data() {
    return {
      selectedCategory: "going",
      msfsForumsUrl: "https://forums.flightsimulator.com",
      searchQuery: "",
    };
  },

  computed: {
    filteredInvitees() {
      const categoryFilteredInvitees = this.filterByCategory();
      return this.filterBySearch(categoryFilteredInvitees);
    },
  },

  methods: {
    filterByCategory() {
      switch (this.selectedCategory) {
        case "going":
          return this.goingInvitees;
        case "interested":
          return this.interestedInvitees;
        case "notGoing":
          return this.notGoingInvitees;
        default:
          return [];
      }
    },

    filterBySearch(invitees) {
      const query = this.searchQuery.toLowerCase();
      return invitees.filter((invitee) =>
        invitee.user.username.toLowerCase().includes(query)
      );
    },

    closeModal() {
      this.$emit("close");
    },

    showCategory(category) {
      this.selectedCategory = category;
    },

    getUserProfileUrl(user) {
        const userName = user.username;
        const profileUrl = `${this.msfsForumsUrl}/u/${userName}`;

        return profileUrl;
    },
  },
}
</script>
