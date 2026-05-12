const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Application = require("../models/Application");
const Match = require("../models/Match");
const Interview = require("../models/Interview");

// GET /api/dashboard/stats  (admin)
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

// GET /api/dashboard/top-matches  (admin)
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

// GET /api/dashboard/upcoming-interviews  (admin)
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

// GET /api/dashboard/student  (student)
const getStudentDashboard = async (req, res) => {
  try {
    const profileId = req.user.profileId;
    if (!profileId) return res.json({ success: true, data: { applications: [], matches: [], interviews: [], profile: null } });

    const [applications, matches, interviews, profile] = await Promise.all([
      Application.find({ candidateId: profileId })
        .populate("companyId", "name industry location")
        .sort({ createdAt: -1 })
        .limit(5),
      Match.find({ candidateId: profileId })
        .populate("companyId", "name industry")
        .sort({ aiScore: -1 })
        .limit(5),
      Interview.find({ candidateId: profileId, scheduledDate: { $gte: new Date().toISOString().split("T")[0] } })
        .populate("companyId", "name")
        .sort({ scheduledDate: 1 })
        .limit(3),
      Candidate.findById(profileId),
    ]);

    const stats = {
      totalApplications: await Application.countDocuments({ candidateId: profileId }),
      activeMatches:     await Match.countDocuments({ candidateId: profileId }),
      interviews:        await Interview.countDocuments({ candidateId: profileId }),
      offers:            await Application.countDocuments({ candidateId: profileId, status: "Offer Sent" }),
    };

    res.json({ success: true, data: { stats, applications, matches, interviews, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/dashboard/company  (company)
const getCompanyDashboard = async (req, res) => {
  try {
    const profileId = req.user.profileId;
    if (!profileId) return res.json({ success: true, data: { applications: [], matches: [], interviews: [], profile: null } });

    const [applications, matches, interviews, profile] = await Promise.all([
      Application.find({ companyId: profileId })
        .populate("candidateId", "name initials avatarColor avatarTextColor degree university skills")
        .sort({ createdAt: -1 })
        .limit(5),
      Match.find({ companyId: profileId })
        .populate("candidateId", "name initials avatarColor avatarTextColor degree university skills")
        .sort({ aiScore: -1 })
        .limit(5),
      Interview.find({ companyId: profileId, scheduledDate: { $gte: new Date().toISOString().split("T")[0] } })
        .populate("candidateId", "name initials avatarColor avatarTextColor")
        .sort({ scheduledDate: 1 })
        .limit(3),
      Company.findById(profileId),
    ]);

    const stats = {
      totalApplications: await Application.countDocuments({ companyId: profileId }),
      activeMatches:     await Match.countDocuments({ companyId: profileId }),
      interviews:        await Interview.countDocuments({ companyId: profileId }),
      offers:            await Application.countDocuments({ companyId: profileId, status: "Offer Sent" }),
    };

    res.json({ success: true, data: { stats, applications, matches, interviews, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getTopMatches, getUpcomingInterviews, getStudentDashboard, getCompanyDashboard };
