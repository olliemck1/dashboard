import { useState, useEffect } from 'react';
import SpotifyWidget from './components/SpotifyWidget';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import CalendarWidget from "./components/CalendarWidget";
import "./Dashboard.css";

const Dashboard = () => {
  const [isFormOpen, setisFormOpen] = useState(false);
  
  // 1. We moved the state up to the Dashboard!
  const [assignments, setAssignments] = useState([]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments");
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to fetch assignments", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return ( 
    <div className='dashboard-container' style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      
      {/* LEFT SIDE: The massive calendar view */}
      <div className="dashboard-card calendar-area" style={{ flex: '2' }}>
        {/* We pass the data down to the calendar as a prop */}
        <CalendarWidget assignments={assignments} />
      </div>

      {/* RIGHT SIDE: A column containing your Top 3 list and Spotify */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1' }}>
        
        <div className="dashboard-card assignments-area">
          <div style={{ display:"flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"}}>
            <h2 style={{margin:0}}>upcoming</h2>

            <button 
              onClick={() => setisFormOpen(!isFormOpen)} 
              style={{padding:"8px 12px", cursor:"pointer", borderRadius:"6px", border:"none", background:"#007bff", color:"white"}} 
            >
              {isFormOpen ? "cancel" : "+ add assignment"}
            </button>
          </div>
          
          {isFormOpen && (
            <div style={{padding:"16px", marginBottom:"20px", backgroundColor:"#f8f9fa", borderRadius:"8px", border:"1px solid #e2e8f0"}}>
              <AssignmentForm onAssignmentAdded={() => {
                setisFormOpen(false);
                fetchAssignments(); // Refreshes everything instantly when you add a task!
              }}/>
            </div>
          )}
          
          {/* We pass the data and the refresh function down to the list */}
          <AssignmentList assignments={assignments} refreshData={fetchAssignments} />
        </div>

        <div className='dashboard-card spotify-area'>
          <SpotifyWidget/>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;