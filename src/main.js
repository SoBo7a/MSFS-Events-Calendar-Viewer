/*---------------------------------------------------------------------------------------------
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
 *--------------------------------------------------------------------------------------------*/


import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import fs from "fs";
import pathModule from "path";
import Notifications from "@kyvg/vue3-notification";

import { FontAwesomeIcon } from './shared/fontawesome-icons'

import "./assets/css/styles.scss";

createApp(App)
  .use(store)
  .use(router)
  .use(fs)
  .use(pathModule)
  .use(Notifications)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
