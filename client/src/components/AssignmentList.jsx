import { useState } from "react";
import { 
  Check, 
  Trash2, 
  Search, 
  Calendar as CalendarIcon, 
  ExternalLink, 
  AlertCircle,
  Clock,
  Inbox
} from "lucide-react";

const AssignmentList = ({ assignments = [], refreshData }) => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refreshData();
      } else {
        console.error("Failed to delete assignment on server");
      }
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === "Completed" ? "Not Started" : "Completed";
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        refreshData();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Helper to format due date badge and urgency
  const getDueStatus = (dueDateString, isCompleted) => {
    if (!dueDateString) return null;
    const due = new Date(dueDateString);
    if (isNaN(due.getTime())) return null;

    const now = new Date();
    // Reset hours for day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (isCompleted) {
      return {
        text: `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        className: "badge-due-normal"
      };
    }

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)}d Overdue`,
        className: "badge-due-urgent"
      };
    } else if (diffDays === 0) {
      return {
        text: "Due Today",
        className: "badge-due-urgent"
      };
    } else if (diffDays === 1) {
      return {
        text: "Due Tomorrow",
        className: "badge-due-soon"
      };
    } else if (diffDays <= 7) {
      return {
        text: `Due in ${diffDays} days`,
        className: "badge-due-soon"
      };
    } else {
      return {
        text: `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        className: "badge-due-normal"
      };
    }
  };

  // Filter assignments based on search and active tab
  const filteredAssignments = assignments.filter((item) => {
    // Search query match
    const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = item.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery && !titleMatch && !subjectMatch) return false;

    // Tab filter
    const now = new Date();
    const isCompleted = item.status === "Completed";

    switch (activeTab) {
      case "upcoming":
        // Not completed and (has dueDate >= today or no dueDate)
        if (isCompleted) return false;
        if (item.dueDate) {
          const due = new Date(item.dueDate);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return due >= today;
        }
        return true;

      case "completed":
        return isCompleted;

      case "blackboard":
        return item.source === "blackboard";

      case "mytimetable":
        return item.source === "mytimetable";

      case "manual":
        return item.source === "manual" || !item.source;

      case "all":
      default:
        return true;
    }
  });

  return (
    <div className="assignments-hub">
      <div className="assignments-header-controls">
        {/* Tab Switcher */}
        <div className="filter-tabs">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "all", label: "All Tasks" },
            { id: "blackboard", label: "Blackboard" },
            { id: "mytimetable", label: "Timetable" },
            { id: "manual", label: "Personal" },
            { id: "completed", label: "Completed" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="search-and-sort">
          <div className="search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search assignments or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="assignment-list">
        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <Inbox size={36} />
            <p>No assignments found</p>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {searchQuery ? "Try a different search keyword" : "All caught up or try switching tabs!"}
            </span>
          </div>
        ) : (
          filteredAssignments.map((item) => {
            const isDone = item.status === "Completed";
            const dueStatus = getDueStatus(item.dueDate, isDone);
            const priorityClass = `badge-priority-${(item.priority || "Medium").toLowerCase()}`;

            return (
              <div
                key={item._id}
                className={`assignment-item-card ${isDone ? "is-completed" : ""}`}
              >
                <div className="item-top-row">
                  <div className="item-left">
                    <button
                      className={`status-checkbox ${isDone ? "checked" : ""}`}
                      onClick={() => handleToggleStatus(item)}
                      title={isDone ? "Mark as Incomplete" : "Mark as Completed"}
                    >
                      {isDone && <Check size={12} strokeWidth={3} />}
                    </button>

                    <div className="item-info">
                      <div className="item-title">{item.title}</div>
                      <div className="item-subject">{item.subject || "General"}</div>
                    </div>
                  </div>

                  <div className="item-actions">
                    {item.resourceLink && item.resourceLink.trim().length > 3 && (
                      <a
                        href={item.resourceLink.startsWith("http") ? item.resourceLink : `https://${item.resourceLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-icon-btn"
                        title="Open Resource Link"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      className="action-icon-btn"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      title="Delete Assignment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="item-bottom-row">
                  <div className="badges-group">
                    <span className={`badge ${priorityClass}`}>
                      {item.priority || "Medium"}
                    </span>
                    <span className="badge badge-source">
                      {item.source || "manual"}
                    </span>
                  </div>

                  {dueStatus && (
                    <div className="badges-group">
                      <span className={`badge ${dueStatus.className}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} />
                        {dueStatus.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignmentList;