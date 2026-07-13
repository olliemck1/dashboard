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

return (
    <div>
      {assignments.map((a) => (
        <div key={a._id} className="assignment-card">
          <h3>{a.title}</h3>
          <p>
            {a.subject} - Due: {new Date(a.dueDate).toLocaleDateString()}
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