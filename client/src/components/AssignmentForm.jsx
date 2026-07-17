import { useState } from "react";

const AssignmentForm = ({ onAssignmentAdded }) => {
    const [formData, setFormData] = useState({title: " ",subject:" ", dueDate:" ",priority:"Medium"});

    const handleSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${import.meta.env.VITE_API_URL}/api/assignments`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(formData)
        });
        onAssignmentAdded();
    };

    return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Assignment Title" onChange={(e) => setFormData({...formData, title: e.target.value})} required />
      <input type="text" placeholder="Subject" onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
      <input type="date" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
      <select onChange={(e) => setFormData({...formData, priority: e.target.value})}>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button type="submit">Add Assignment</button>
    </form>
  );
};

export default AssignmentForm;
