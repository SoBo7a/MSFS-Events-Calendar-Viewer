/*---------------------------------------------------------------------------------------------
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
 *--------------------------------------------------------------------------------------------*/


import { createStore } from 'vuex';


const store = createStore({
  state: {
    selectedDate: new Date().toUTCString(),
  },

  mutations: {
    setSelectedDate(state, date) {
      state.selectedDate = date;
    },
  },

  actions: {
    updateSelectedDate({ commit }, date) {
      commit('setSelectedDate', date);
    },
  },

  getters: {
    selectedDate: state => state.selectedDate,
  },
});

export default store;