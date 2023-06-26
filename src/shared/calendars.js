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
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  