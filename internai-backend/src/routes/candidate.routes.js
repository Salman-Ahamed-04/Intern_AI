const router = require("express").Router();
const { getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate } = require("../controllers/candidate.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.route("/").get(getCandidates).post(createCandidate);
router.route("/:id").get(getCandidate).put(updateCandidate).delete(deleteCandidate);
module.exports = router;
