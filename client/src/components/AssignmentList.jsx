import { useState, useEffect } from "react";

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await fetch("/api/assignments");
      const data = await res.json();
      setAssignments(data);
    };

    fetchAssignments();
  }, []); 

  const handleDelete = async (id) => {
    try {
      const response = await fetch (`api/assignments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAssignments((prevAssignment) =>
          prevAssignment.filter((assignment) => assignment._id !== id)
      );
      } else {
        console.error("Failed to delete (server side)")
      }
    } catch (error) {
      console.error("Failed to delete (client)", error)
    }
  };
  
  console.log("Raw Database Data:", assignments);
  const upcomingDeadlines = assignments
    .filter(event => event.source === "blackboard")
    .filter(event => event.dueDate)
    .filter(event => new Date(event.dueDate) >= new Date())
    .sort((a,b) => new Date(a.dueDate)- new Date(b.dueDate))
    .slice(0,3);

return (
    <div>
      {upcomingDeadlines.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>
            {a.subject} - Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "TBD"}
          </p>
          <span>Priority: {a.priority}</span>
          <br />
          
          <button 
            onClick={() => handleDelete(a._id)}
            style={{ marginTop: "10px", cursor: "pointer" }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList;