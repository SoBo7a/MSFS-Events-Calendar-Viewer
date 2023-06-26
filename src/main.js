import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import fs from 'fs'
import pathModule from 'path'
import Notifications from '@kyvg/vue3-notification'

/* FontAwesome */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faChrome } from '@fortawesome/free-brands-svg-icons'
import { faUserSecret, faArrowsRotate, faClockRotateLeft, faCopy, faHouseChimney, faPrint, faCalendarDays, faArrowUp, faCalendarDay } from '@fortawesome/free-solid-svg-icons'
import { faClock, faCalendarCheck } from '@fortawesome/free-regular-svg-icons'

import './assets/css/styles.scss';

/* add icons to the library */
library.add(faChrome, faUserSecret, faArrowsRotate, faClockRotateLeft, faCopy, faClock, faHouseChimney, faPrint, faCalendarDays, faArrowUp, faCalendarDay, faCalendarCheck)

createApp(App)
    .use(store)
    .use(router)
    .use(fs)
    .use(pathModule)
    .use(Notifications)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount("#app");
