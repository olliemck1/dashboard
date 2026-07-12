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

  return (
    <div>
      {assignments.map((a) => (
        <div key={a._id}>
          <h3>{a.title}</h3>
          <p>
            {a.subject} - Due: {new Date(a.dueDate).toLocaleDateString()}
          </p>
          <span>Priority: {a.priority}</span>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList; 