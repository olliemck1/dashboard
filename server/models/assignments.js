const mongoose = require("mongoose")

const assingnmentSchema = new mongoose.Schema({
    title: {type:String, required: True},
    subject: String,
    dueDate: Date,
    priority: {type:String, enum:["Low","Medium","High"], default:"Medium"},
    status: {type:String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started"},
    createdAt: {type:Date, default: Date.now},
    resourceLink: {type: String, default: " "},
    dashboardID: {type:String, default:"primary_user"}
});

module.exports = mongoose.model("Assignment", assingnmentSchema)