const Company = require("../models/Company");

// GET /api/companies
const getCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status } = req.query;
    const query = {};

    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Company.countDocuments(query);
    const data = await Company.find(query)
      .sort({ totalHires: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/companies/:id
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/companies
const createCompany = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Company name is required" });

    const exists = await Company.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (exists) return res.status(400).json({ success: false, message: "Company already exists" });

    const company = await Company.create(req.body);
    res.status(201).json({ success: true, message: "Company created", data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/companies/:id
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, message: "Company updated", data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });
    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany };
