const router = require("express").Router();
const { runMatchForCandidate, runMatchAll, previewProlog, diagnose } = require("../controllers/prolog.controller");

router.post("/match", runMatchForCandidate);
router.post("/match-all", runMatchAll);
router.post("/preview", previewProlog);
router.post("/diagnose", diagnose);

module.exports = router;
