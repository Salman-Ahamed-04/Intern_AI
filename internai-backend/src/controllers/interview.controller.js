const Interview = require("../models/Interview");

// GET /api/interviews
const getInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;

    const total = await Interview.countDocuments(query);
    const data = await Interview.find(query)
      .populate("candidateId", "name initials avatarColor avatarTextColor")
      .populate("companyId", "name")
      .sort({ scheduledDate: 1, scheduledTime: 1 })
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

// GET /api/interviews/:id
const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidateId")
      .populate("companyId");
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, data: interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/interviews
const createInterview = async (req, res) => {
  try {
    const { candidateId, companyId, role, scheduledDate, scheduledTime } = req.body;
    if (!candidateId || !companyId || !role || !scheduledDate || !scheduledTime)
      return res.status(400).json({ success: false, message: "candidateId, companyId, role, scheduledDate and scheduledTime are required" });

    const interview = await Interview.create(req.body);
    res.status(201).json({ success: true, message: "Interview scheduled", data: interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/interviews/:id
const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, message: "Interview updated", data: interview });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findByIdAndDelete(req.params.id);
    if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
    res.json({ success: true, message: "Interview deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getInterviews, getInterview, createInterview, updateInterview, deleteInterview };
