import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { faChrome, faGoogle } from "@fortawesome/free-brands-svg-icons";

import {
  faUserSecret,
  faArrowsRotate,
  faClockRotateLeft,
  faCopy,
  faHouseChimney,
  faPrint,
  faCalendarDays,
  faArrowUp,
  faCalendarDay,
  faCalendarPlus,
  faSun,
  faMoon,
  faLink,
  faDoorOpen,
  faShareNodes,
  faCircleInfo,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";

import {
  faClock,
  faCalendarCheck,
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faWindowClose,
} from "@fortawesome/free-regular-svg-icons";


const iconObj = {
  faChrome,
  faGoogle,
  faUserSecret,
  faArrowsRotate,
  faClockRotateLeft,
  faCopy,
  faClock,
  faHouseChimney,
  faPrint,
  faCalendarDays,
  faArrowUp,
  faCalendarDay,
  faCalendarPlus,
  faCalendarCheck,
  faWindowMinimize,
  faWindowMaximize,
  faWindowRestore,
  faWindowClose,
  faSun,
  faMoon,
  faLink,
  faDoorOpen,
  faShareNodes,
  faCircleInfo,
  faXmarkCircle,
};

// Convert the icon objects to an array
const iconArray = Object.values(iconObj);

library.add(...iconArray);

export { FontAwesomeIcon, iconObj };
