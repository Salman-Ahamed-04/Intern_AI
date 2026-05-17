const router = require("express").Router();
const { login, register, getMe, changePassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
router.post("/login", login);
router.post("/register", register);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
module.exports = router;
