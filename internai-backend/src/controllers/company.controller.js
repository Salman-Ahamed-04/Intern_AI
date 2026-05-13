const Company = require("../models/Company");

const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { name:     { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    const total = await Company.countDocuments(query);
    const data  = await Company.find(query)
      .sort({ totalHires: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Company name is required" });
    const exists = await Company.findOne({ name: { $regex: "^" + name + "$", $options: "i" } });
    if (exists) return res.status(400).json({ success: false, message: "Company already exists" });
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, message: "Company created", data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, message: "Company updated", data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPendingCompanies = async (req, res) => {
  try {
    const data = await Company.find({ approvalStatus: "pending" }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveCompany = async (req, res) => {
  try {
    const { approvalStatus, approvalNote } = req.body;
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "approvalStatus must be approved or rejected" });
    }
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      {
        approvalStatus,
        approvalNote: approvalNote || "",
        status: approvalStatus === "approved" ? "Active" : "Inactive"
      },
      { new: true }
    );
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, message: "Company " + approvalStatus, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, getPendingCompanies, approveCompany };
