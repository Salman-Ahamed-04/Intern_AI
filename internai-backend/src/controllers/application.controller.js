const Application = require("../models/Application");

// GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;

    const total = await Application.countDocuments(query);
    const data = await Application.find(query)
      .populate("candidateId", "name initials avatarColor avatarTextColor university degree")
      .populate("companyId", "name industry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Apply search after populate (on populated fields)
    const filtered = search
      ? data.filter(
          (a) =>
            a.candidateId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.companyId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.role?.toLowerCase().includes(search.toLowerCase())
        )
      : data;

    res.json({
      success: true,
      data: filtered,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/applications/:id
const getApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("candidateId")
      .populate("companyId");
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { candidateId, companyId, role } = req.body;
    if (!candidateId || !companyId || !role)
      return res.status(400).json({ success: false, message: "candidateId, companyId and role are required" });

    const app = await Application.create(req.body);
    res.status(201).json({ success: true, message: "Application created", data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/applications/:id
const updateApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, message: "Application updated", data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });
    res.json({ success: true, message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getApplications, getApplication, createApplication, updateApplication, deleteApplication };
