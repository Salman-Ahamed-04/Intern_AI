const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Match = require("../models/Match");

// GET /api/analytics/overview
const getOverview = async (req, res) => {
  try {
    const [totalMatches, placements, activeStudents, partnerCompanies, matches] = await Promise.all([
      Match.countDocuments(),
      Match.countDocuments({ status: "Offer Sent" }),
      Candidate.countDocuments({ status: "Active" }),
      Company.countDocuments({ status: "Active" }),
      Match.find({}, "aiScore"),
    ]);

    const avgMatchScore =
      matches.length > 0
        ? Math.round(matches.reduce((s, m) => s + m.aiScore, 0) / matches.length)
        : 0;

    res.json({ success: true, data: { totalMatches, placements, activeStudents, partnerCompanies, avgMatchScore } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/monthly
const getMonthlyStats = async (req, res) => {
  try {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [matches, placements] = await Promise.all([
        Match.countDocuments({ createdAt: { $gte: start, $lte: end } }),
        Match.countDocuments({ status: "Offer Sent", createdAt: { $gte: start, $lte: end } }),
      ]);

      data.push({
        month: d.toLocaleString("default", { month: "short" }),
        year: d.getFullYear(),
        matches,
        placements,
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/top-companies
const getTopCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ status: "Active" })
      .sort({ totalHires: -1 })
      .limit(5)
      .select("name totalHires openRoles industry");
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/top-skills
const getTopSkills = async (req, res) => {
  try {
    const result = await Candidate.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { skill: "$_id", count: 1, _id: 0 } },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOverview, getMonthlyStats, getTopCompanies, getTopSkills };
