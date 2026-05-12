const router = require("express").Router();
const { getInterviews, getInterview, createInterview, updateInterview, deleteInterview } = require("../controllers/interview.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.route("/").get(getInterviews).post(createInterview);
router.route("/:id").get(getInterview).put(updateInterview).delete(deleteInterview);
module.exports = router;
