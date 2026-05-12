const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    role: { type: String, required: true },
    aiScore: { type: Number, min: 0, max: 100, default: 0 },
    matchedSkills: [{ type: String }],
    status: {
      type: String,
      enum: ["Applied", "In Review", "Interview", "Offer Sent", "Rejected"],
      default: "In Review",
    },
    acceptedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
