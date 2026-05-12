const router = require("express").Router();
const { getStats, getTopMatches, getUpcomingInterviews } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.get("/stats", getStats);
router.get("/top-matches", getTopMatches);
router.get("/upcoming-interviews", getUpcomingInterviews);
module.exports = router;
