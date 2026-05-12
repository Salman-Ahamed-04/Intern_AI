const router = require("express").Router();
const { getStats, getTopMatches, getUpcomingInterviews, getStudentDashboard, getCompanyDashboard } = require("../controllers/dashboard.controller");
const { protect, requireAdmin, requireRole } = require("../middleware/auth.middleware");

router.use(protect);

// Admin routes
router.get("/stats",               requireAdmin, getStats);
router.get("/top-matches",         requireAdmin, getTopMatches);
router.get("/upcoming-interviews", requireAdmin, getUpcomingInterviews);

// Role-specific dashboards
router.get("/student",  requireRole("student"), getStudentDashboard);
router.get("/company",  requireRole("company"), getCompanyDashboard);

module.exports = router;
