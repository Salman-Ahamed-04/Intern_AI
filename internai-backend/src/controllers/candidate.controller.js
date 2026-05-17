const Candidate = require("../models/Candidate");

// GET /api/candidates
const getCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const query = {};

    if (status && status !== "All") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Candidate.countDocuments(query);
    const data = await Candidate.find(query)
      .sort({ createdAt: -1 })
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

// GET /api/candidates/:id
const getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.json({ success: true, data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/candidates
const createCandidate = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ success: false, message: "Name and email are required" });

    const exists = await Candidate.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

    const candidate = await Candidate.create(req.body);
    res.status(201).json({ success: true, message: "Candidate created", data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/candidates/:id
const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.json({ success: true, message: "Candidate updated", data: candidate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/candidates/:id
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
    res.json({ success: true, message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate };
