const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    role: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    type: { type: String, enum: ["Video", "Onsite", "Phone"], default: "Video" },
    interviewer: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "Pending", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    feedback: { type: String, default: "" },
    outcome: { type: String, enum: ["Pass", "Fail", ""], default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);
