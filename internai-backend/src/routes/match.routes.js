const router = require("express").Router();
const { getMatches, getMatch, createMatch, updateMatch, deleteMatch } = require("../controllers/match.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.route("/").get(getMatches).post(createMatch);
router.route("/:id").get(getMatch).put(updateMatch).delete(deleteMatch);
module.exports = router;
