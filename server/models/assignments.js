const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: String,
    dueDate: Date,
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },
    createdAt: { type: Date, default: Date.now },
    resourceLink: { type: String, default: " " },
    dashboardID: { type: String, default: "primary_user" },
    //syncing fields for when events imported from .ics links
    syncId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    source: { 
        type: String, 
        enum: ["manual", "blackboard", "mytimetable"], 
        default: "manual" 
    }
});

module.exports = mongoose.model("Assignment", assignmentSchema);