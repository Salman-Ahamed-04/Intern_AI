const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidateId:   { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    companyId:     { type: mongoose.Schema.Types.ObjectId, ref: "Company",   required: true },
    internshipId:  { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
    role:          { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "In Review", "Interview", "Offer Sent", "Rejected"],
      default: "Applied",
    },
    appliedDate:   { type: String, default: () => new Date().toISOString().split("T")[0] },
    notes:         { type: String, default: "" },
    coverLetter:   { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
