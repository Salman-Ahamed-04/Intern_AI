const Application = require("../models/Application");
const Internship  = require("../models/Internship");

// GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, candidateId, companyId } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (candidateId) query.candidateId = candidateId;
    if (companyId)   query.companyId   = companyId;

    // Role-based scoping: students see only their own, companies see only theirs
    if (req.user.role === "student" && req.user.profileId) {
      query.candidateId = req.user.profileId;
    } else if (req.user.role === "company" && req.user.profileId) {
      query.companyId = req.user.profileId;
    }

    const total = await Application.countDocuments(query);
    const data  = await Application.find(query)
      .populate("candidateId", "name initials avatarColor avatarTextColor university degree skills")
      .populate("companyId",   "name industry")
      .populate("internshipId","title imageUrl")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filtered = search
      ? data.filter(a =>
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
      .populate("companyId")
      .populate("internshipId");
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

    // Prevent duplicate applications to same internship
    if (req.body.internshipId) {
      const exists = await Application.findOne({ candidateId, internshipId: req.body.internshipId });
      if (exists) return res.status(400).json({ success: false, message: "You have already applied for this internship" });
    }

    const app = await Application.create(req.body);

    // Increment applicant count on internship
    if (req.body.internshipId) {
      await Internship.findByIdAndUpdate(req.body.internshipId, { $inc: { applicants: 1 } });
    }

    res.status(201).json({ success: true, message: "Application submitted", data: app });
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
