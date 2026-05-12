const router = require("express").Router();
const { getOverview, getMonthlyStats, getTopCompanies, getTopSkills } = require("../controllers/analytics.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.get("/overview", getOverview);
router.get("/monthly", getMonthlyStats);
router.get("/top-companies", getTopCompanies);
router.get("/top-skills", getTopSkills);
module.exports = router;
