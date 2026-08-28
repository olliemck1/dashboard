import { useState } from "react";
import { Plus, X, Calendar as CalendarIcon, BookOpen, Flag, Link as LinkIcon, Loader2 } from "lucide-react";

const AssignmentForm = ({ onAssignmentAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    dueDate: "",
    priority: "Medium",
    resourceLink: "",
    source: "manual"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a title for the assignment.");
      return;
    }
    if (!formData.dueDate) {
      setError("Please select a due date.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          subject: formData.subject.trim() || "General",
          resourceLink: formData.resourceLink.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create assignment. Please try again.");
      }

      onAssignmentAdded();
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="assignment-form">
      {error && (
        <div style={{
          padding: "10px 14px",
          background: "var(--color-danger-bg)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-danger)",
          fontSize: "0.85rem",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span>{error}</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <BookOpen size={14} /> Assignment Title
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Algorithms Coursework, Essay Draft"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          autoFocus
        />
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Subject / Module</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. COMP2181, Machine Learning"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CalendarIcon size={14} /> Due Date
          </label>
          <input
            type="date"
            className="form-input"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Flag size={14} /> Priority Level
        </label>
        <div className="priority-selector-pills">
          {["Low", "Medium", "High"].map((level) => (
            <button
              key={level}
              type="button"
              className={`priority-pill ${formData.priority === level ? `selected-${level}` : ""}`}
              onClick={() => setFormData({ ...formData, priority: level })}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <LinkIcon size={14} /> Resource Link (Optional)
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://..."
          value={formData.resourceLink}
          onChange={(e) => setFormData({ ...formData, resourceLink: e.target.value })}
        />
      </div>

      <div className="form-modal-actions">
        {onCancel && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="spin-icon" /> Creating...
            </>
          ) : (
            <>
              <Plus size={16} /> Save Assignment
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;
