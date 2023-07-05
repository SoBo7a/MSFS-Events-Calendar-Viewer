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


import { shell } from 'electron';
import { createEvent } from 'ics';


export function getICSFile(event) {
  const start = new Date(event.event.start);
  const startTime = [
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    start.getHours(),
    start.getMinutes(),
  ];
  let endTime = null;
  if (event.event.end) {
    const end = new Date(event.event.end);
    endTime = [
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
    ];
  }

  const calenderEvent = {
    title: event.fancy_title,
    description: event.excerpt,
    location: "Microsoft Flight Simulator",
    start: startTime,
    end: endTime != null ? endTime : startTime,
  };

  const { error, value } = createEvent(calenderEvent);
  if (error) {
    console.error(error);
  } else {
    downloadICSFile(value, `${event.fancy_title}.ics`);
  }
}


export function addEventToGoogleCalendar(event) {
  const formattedStart = convertToRFC5545Format(event.event.start);
  let formattedEnd = null;
  if (event.event.end) {
    formattedEnd = convertToRFC5545Format(event.event.end);
  }

  // Encode the event details
  const encodedTitle = encodeURIComponent(event.fancy_title);
  const encodedDescription = encodeURIComponent(event.excerpt);
  const encodedLocation = encodeURIComponent("Microsoft Flight Simulator");
  const encodedStart = encodeURIComponent(formattedStart);
  const encodedEnd = encodeURIComponent(
    formattedEnd != null ? formattedEnd : formattedStart
  );

  // Construct the URL with the encoded parameters
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&details=${encodedDescription}&location=${encodedLocation}&dates=${encodedStart}/${encodedEnd}`;

  // Open the URL in a new tab or window
  shell.openExternal(url);
}


function convertToRFC5545Format(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const formattedDateTime = dateTime
    .toISOString()
    .replace(/[:-]/g, "") // Remove hyphens and colons
    .replace(".000", "Z"); // Replace milliseconds and add 'Z' for UTC

  return formattedDateTime;
}


function downloadICSFile(content, filename) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.className = 'auto-clicked-link'
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  