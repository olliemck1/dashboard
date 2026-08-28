import { useState, useEffect } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Clock, 
  X,
  Radio,
  BookOpen,
  Sparkles
} from 'lucide-react';
import SpotifyWidget from './components/SpotifyWidget';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import CalendarWidget from "./components/CalendarWidget";
import "./Dashboard.css";

const Dashboard = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAssignments(data);
      }
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCalendars = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/calendar/sync`, {
        method: "POST"
      });
      const data = await res.json();
      await fetchAssignments();
      showToast(data.message || "Calendars synced successfully!");
    } catch (err) {
      console.error("Failed to sync calendars", err);
      showToast("Error syncing calendars. Check backend connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();

    // Check if redirected from Spotify login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify_auth') === 'success') {
      showToast("Spotify connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Compute KPI summary metrics
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inSevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingCount = assignments.filter((item) => {
    if (item.status === "Completed" || !item.dueDate) return false;
    const due = new Date(item.dueDate);
    return due >= today && due <= inSevenDays;
  }).length;

  const highPriorityCount = assignments.filter((item) => {
    return item.status !== "Completed" && item.priority === "High";
  }).length;

  const completedCount = assignments.filter((item) => item.status === "Completed").length;
  const activeCount = assignments.filter((item) => item.status !== "Completed").length;

  return ( 
    <div className="dashboard-root">
      
      {/* EXECUTIVE HEADER */}
      <header className="dashboard-header">
        <div className="header-brand">
          <div className="brand-icon-wrapper">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="brand-title">
              Academic & Focus Hub
            </h1>
            <p className="brand-subtitle">
              Personal Command Center • Durham University
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Live Date and Time */}
          <div className="live-clock">
            <span className="live-dot"></span>
            <span>
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              {" • "}
              {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Sync Calendars Action */}
          <button 
            className={`btn-secondary ${isSyncing ? "is-syncing" : ""}`}
            onClick={handleSyncCalendars}
            disabled={isSyncing}
            title="Sync Blackboard and Timetable ics feeds"
          >
            <RefreshCw size={15} className={isSyncing ? "spin-icon" : ""} />
            <span>{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
          </button>

          {/* Add Assignment Action */}
          <button 
            className="btn-primary"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </header>

      {/* TOP KPI METRICS ROW */}
      <section className="metrics-grid">
        <div className="metric-card" style={{ "--card-accent": "#ef4444" }}>
          <div className="metric-icon-box" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
            <AlertTriangle size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Due in 7 Days</span>
            <span className="metric-value">{upcomingCount}</span>
            <span className="metric-subtext">Immediate focus required</span>
          </div>
        </div>

        <div className="metric-card" style={{ "--card-accent": "#f59e0b" }}>
          <div className="metric-icon-box" style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>
            <Clock size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">High Priority</span>
            <span className="metric-value">{highPriorityCount}</span>
            <span className="metric-subtext">Critical assignments</span>
          </div>
        </div>

        <div className="metric-card" style={{ "--card-accent": "#6366f1" }}>
          <div className="metric-icon-box" style={{ background: "var(--accent-primary-glow)", color: "var(--accent-primary)" }}>
            <BookOpen size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Tasks</span>
            <span className="metric-value">{activeCount}</span>
            <span className="metric-subtext">{completedCount} tasks completed</span>
          </div>
        </div>

        <div className="metric-card" style={{ "--card-accent": "#10b981" }}>
          <div className="metric-icon-box" style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Completion Rate</span>
            <span className="metric-value">
              {assignments.length > 0 ? `${Math.round((completedCount / assignments.length) * 100)}%` : "100%"}
            </span>
            <span className="metric-subtext">{assignments.length} total deliverables</span>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN DASHBOARD GRID */}
      <main className="dashboard-main-grid">
        
        {/* LEFT COLUMN: Modern Interactive Calendar */}
        <section className="dashboard-card calendar-area">
          <div className="card-header-row">
            <div className="card-title-group">
              <CalendarIcon size={20} color="var(--accent-primary)" />
              <h2 className="card-title">Academic Schedule</h2>
            </div>
            <span className="card-badge">Live Sync</span>
          </div>
          
          <CalendarWidget assignments={assignments} />
        </section>

        {/* RIGHT COLUMN: Assignment Hub & Spotify Music Deck */}
        <div className="assignments-column">
          
          {/* Assignment Management Hub */}
          <section className="dashboard-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <Layers size={20} color="var(--accent-primary)" />
                <h2 className="card-title">Deadlines & Tasks</h2>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setIsFormOpen(true)}
                style={{ padding: "5px 10px", fontSize: "0.775rem" }}
              >
                <Plus size={14} /> New
              </button>
            </div>

            <AssignmentList assignments={assignments} refreshData={fetchAssignments} />
          </section>

          {/* Spotify Focus Player Deck */}
          <section className="dashboard-card spotify-area">
            <SpotifyWidget />
          </section>

        </div>

      </main>

      {/* ADD ASSIGNMENT MODAL */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="card-title-group">
                <Plus size={20} color="var(--accent-primary)" />
                <h3 className="modal-title">Create New Task</h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsFormOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <AssignmentForm
              onAssignmentAdded={() => {
                setIsFormOpen(false);
                fetchAssignments();
                showToast("Assignment added successfully!");
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle2 size={18} color="var(--color-success)" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;