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
