// 1. Notice we don't need useState or useEffect imports anymore!
const AssignmentList = ({ assignments, refreshData }) => {
  
  // 2. We use the refreshData function passed from the Dashboard to trigger updates
  const handleDelete = async (id) => {
    try {
      const response = await fetch (`${import.meta.env.VITE_API_URL}/api/assignments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refreshData(); 
      } else {
        console.error("Failed to delete (server side)");
      }
    } catch (error) {
      console.error("Failed to delete (client)", error);
    }
  };

  const upcomingDeadlines = assignments
    .filter(event => event.source === "blackboard")
    .filter(event => event.dueDate)
    .filter(event => new Date(event.dueDate) >= new Date())
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
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