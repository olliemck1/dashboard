import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Tag, 
  X, 
  ExternalLink,
  BookOpen
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-GB": enGB,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Custom Calendar Toolbar
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
  return (
    <div className="calendar-custom-toolbar">
      <div className="toolbar-nav-group">
        <button className="toolbar-btn" onClick={() => onNavigate("PREV")} title="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className="toolbar-btn" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button className="toolbar-btn" onClick={() => onNavigate("NEXT")} title="Next">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="toolbar-label">{label}</div>

      <div className="toolbar-view-group">
        {[
          { id: "month", label: "Month" },
          { id: "week", label: "Week" },
          { id: "day", label: "Day" },
          { id: "agenda", label: "Agenda" }
        ].map((v) => (
          <button
            key={v.id}
            className={`toolbar-btn ${view === v.id ? "active" : ""}`}
            onClick={() => onView(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const CalendarWidget = ({ assignments = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Transform assignments into React-Big-Calendar events
  const calendarEvents = assignments
    .filter((event) => event.dueDate || event.startDate)
    .map((event) => {
      const startDate = event.startDate ? new Date(event.startDate) : new Date(event.dueDate);
      let endDate = event.endDate ? new Date(event.endDate) : new Date(event.dueDate);
      
      // If start and end are identical timestamps, set end 1 hour later for visibility in day/week views
      if (startDate.getTime() === endDate.getTime()) {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }

      return {
        id: event._id || event.syncId,
        title: event.title,
        start: startDate,
        end: endDate,
        allDay: !event.startDate,
        resource: event,
      };
    });

  // Event style getter based on source and priority
  const eventPropGetter = (event) => {
    const raw = event.resource || {};
    let customClass = "event-source-manual";

    if (raw.priority === "High") {
      customClass = "event-priority-high";
    } else if (raw.source === "blackboard") {
      customClass = "event-source-blackboard";
    } else if (raw.source === "mytimetable") {
      customClass = "event-source-mytimetable";
    }

    return {
      className: customClass,
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  return (
    <div className="calendar-area">
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "day", "agenda"]}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          components={{
            toolbar: CustomToolbar,
          }}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title-group">
                <CalendarIcon size={20} color="var(--accent-primary)" />
                <h3 className="modal-title">Event Details</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {selectedEvent.title}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {selectedEvent.subject || "General"}
                </p>
              </div>

              <div style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "0.85rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                  <Clock size={15} color="var(--accent-primary)" />
                  <span>
                    <strong>Due / Time: </strong>
                    {selectedEvent.dueDate
                      ? new Date(selectedEvent.dueDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                      : "Not specified"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                  <Tag size={15} color="var(--accent-primary)" />
                  <span>
                    <strong>Source: </strong>
                    <span style={{ textTransform: "capitalize" }}>{selectedEvent.source || "Manual"}</span>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                  <BookOpen size={15} color="var(--accent-primary)" />
                  <span>
                    <strong>Priority: </strong>
                    <span className={`badge badge-priority-${(selectedEvent.priority || "Medium").toLowerCase()}`}>
                      {selectedEvent.priority || "Medium"}
                    </span>
                  </span>
                </div>
              </div>

              {selectedEvent.resourceLink && selectedEvent.resourceLink.trim().length > 3 && (
                <a
                  href={selectedEvent.resourceLink.startsWith("http") ? selectedEvent.resourceLink : `https://${selectedEvent.resourceLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ justifyContent: "center", marginTop: "6px" }}
                >
                  <ExternalLink size={16} /> Open Resource Link
                </a>
              )}
            </div>

            <div className="form-modal-actions" style={{ marginTop: "20px" }}>
              <button
                className="btn-secondary"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;