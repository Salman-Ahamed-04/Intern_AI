const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    companyId:    { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title:        { type: String, required: true, trim: true },
    description:  { type: String, default: "" },
    requirements: { type: String, default: "" },
    location:     { type: String, default: "" },
    type:         { type: String, enum: ["Remote", "On-site", "Hybrid"], default: "On-site" },
    duration:     { type: String, default: "" },        // e.g. "3 months"
    stipend:      { type: String, default: "" },        // e.g. "$500/month"
    skills:       [{ type: String }],
    deadline:     { type: String, default: "" },        // ISO date string
    imageUrl:     { type: String, default: "" },        // Cloudinary URL
    imagePublicId:{ type: String, default: "" },        // Cloudinary public_id
    status:       { type: String, enum: ["Open", "Closed"], default: "Open" },
    applicants:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", internshipSchema);
