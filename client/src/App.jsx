import { useState } from 'react';
import SpotifyWidget from './components/SpotifyWidget';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import "./Dashboard.css";


const Dashboard = () => {
  const [isFormOpen, setisFormOpen] = useState(false);

  return ( <div className='dashboard-container'>
    <div className="dashboard-card assignments-area">
      <div style={{ display:"felx", justifyContent: "space-between", alignItems: "center", marginBottom: "16px"}}>
        <h2 style={{margin:0}}> assignments</h2>

        <button onClick={() => setisFormOpen(!isFormOpen)} style={{padding:"8px 12px", cursor:"pointer", borderRadius:"6px", border:"none", background:"#007bff", colour:"white"}} >
          {isFormOpen ? "cancel": "+ add assignment"}
        </button>
      </div>
       {isFormOpen && (
        <div style={{padding:"16px", marginBottom:"20px", backgroundColor:"#f8f9fa", borderRadius:"8px", border:"1px solid #e2e8f0"}}>
          <AssignmentForm onAssignmentAdded={() => {setisFormOpen(false)}}/>
        </div>
       )}
       <AssignmentList/>
    </div>
    <div className='dashboard-card spotify-area'>
      <SpotifyWidget/>
    </div>
    <div className='dashboard-card email-placeholder'>
      <h3>personal inbox</h3>
      <p style={{color:"gray",}}> Coming Soon </p>
    </div>
  </div>
  );
};

export default Dashboard;