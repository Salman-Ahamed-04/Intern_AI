const Match = require("../models/Match");

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;

    const total = await Match.countDocuments(query);
    const data = await Match.find(query)
      .populate("candidateId", "name initials avatarColor avatarTextColor degree university")
      .populate("companyId", "name industry")
      .sort({ aiScore: -1 })
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

// GET /api/matches/:id
const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("candidateId")
      .populate("companyId");
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.json({ success: true, data: match });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/matches
const createMatch = async (req, res) => {
  try {
    const { candidateId, companyId, role } = req.body;
    if (!candidateId || !companyId || !role)
      return res.status(400).json({ success: false, message: "candidateId, companyId and role are required" });

    const match = await Match.create(req.body);
    res.status(201).json({ success: true, message: "Match created", data: match });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/matches/:id
const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.json({ success: true, message: "Match updated", data: match });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/matches/:id
const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ success: false, message: "Match not found" });
    res.json({ success: true, message: "Match deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMatches, getMatch, createMatch, updateMatch, deleteMatch };
