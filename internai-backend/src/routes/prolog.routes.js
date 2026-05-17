const router = require("express").Router();
const { runMatchForCandidate, runMatchAll, previewProlog, diagnose } = require("../controllers/prolog.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/match",                runMatchForCandidate);
router.post("/match-all",            runMatchAll);
router.get("/preview/:candidateId",  previewProlog);
router.get("/diagnose/:candidateId", diagnose);

module.exports = router;
