import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enGB from "date-fns/locale/en-GB";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-GB": enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarWidget = ({ assignments }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");

  const calendarEvents = assignments
    .filter(event => event.dueDate)
    .map(event => ({
      title: event.title,
      start: event.startDate ? new Date(event.startDate) : new Date(event.dueDate),
      end: event.endDate ? new Date(event.endDate) : new Date(event.dueDate),
      resource: event
    }));

  return (
    <div style={{ height: "600px", backgroundColor: "white", padding: "15px", borderRadius: "8px" }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        view={currentView}
        onView={(newView) => setCurrentView(newView)}
      />
    </div>
  );
};

export default CalendarWidget;