const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    initials: { type: String },
    avatarColor: { type: String, default: "#e8f5f0" },
    avatarTextColor: { type: String, default: "#1a9e75" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    degree: { type: String, default: "" },
    university: { type: String, default: "" },
    gpa: { type: Number, min: 0, max: 4 },
    graduationYear: { type: Number },
    skills: [{ type: String }],
    bio: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Placed", "Interview", "Inactive"], default: "Active" },
    matchCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate initials before saving
candidateSchema.pre("save", function (next) {
  if (!this.initials && this.name) {
    const parts = this.name.trim().split(" ");
    this.initials = (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Candidate", candidateSchema);
