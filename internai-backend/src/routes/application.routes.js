const router = require("express").Router();
const { getApplications, getApplication, createApplication, updateApplication, deleteApplication } = require("../controllers/application.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.route("/").get(getApplications).post(createApplication);
router.route("/:id").get(getApplication).put(updateApplication).delete(deleteApplication);
module.exports = router;
