const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    industry:      { type: String, default: "" },
    location:      { type: String, default: "" },
    website:       { type: String, default: "" },
    email:         { type: String, default: "", lowercase: true, trim: true },
    phone:         { type: String, default: "" },
    description:   { type: String, default: "" },
    openRoles:     { type: Number, default: 0 },
    totalHires:    { type: Number, default: 0 },
    status:        { type: String, enum: ["Active", "Inactive"], default: "Active" },
    contactPerson: { type: String, default: "" },
    // Admin approval
    approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvalNote:   { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
