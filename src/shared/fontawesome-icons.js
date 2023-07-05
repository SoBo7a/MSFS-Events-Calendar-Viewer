/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2023 SoBo7a.
 * 
 * This file is part of MSFS Events Calendar Viewer <linkToMyRepo>.
 * 
 * MSFS Events Calendar Viewer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * MSFS Events Calendar Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with MSFS Events Calendar Viewer.  If not, see <http://www.gnu.org/licenses/>.
 *--------------------------------------------------------------------------------------------*/


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
