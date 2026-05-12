const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Application = require("../models/Application");
const Match = require("../models/Match");
const Interview = require("../models/Interview");

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const [activeStudents, partnerCompanies, openInternships, successfulMatches] = await Promise.all([
      Candidate.countDocuments({ status: "Active" }),
      Company.countDocuments({ status: "Active" }),
      Application.countDocuments({ status: { $in: ["Applied", "In Review", "Interview"] } }),
      Match.countDocuments({ status: "Offer Sent" }),
    ]);

    res.json({ success: true, data: { activeStudents, partnerCompanies, openInternships, successfulMatches } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/top-matches
const getTopMatches = async (req, res) => {
  try {
    const data = await Match.find()
      .populate("candidateId", "name initials avatarColor avatarTextColor degree university")
      .populate("companyId", "name")
      .sort({ aiScore: -1 })
      .limit(10);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/upcoming-interviews
const getUpcomingInterviews = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const data = await Interview.find({
      scheduledDate: { $gte: today },
      status: { $in: ["Scheduled", "Confirmed"] },
    })
      .populate("candidateId", "name initials avatarColor avatarTextColor")
      .populate("companyId", "name")
      .sort({ scheduledDate: 1 })
      .limit(5);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getTopMatches, getUpcomingInterviews };
