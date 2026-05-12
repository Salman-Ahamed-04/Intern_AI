const router = require("express").Router();
const {
  getInternships, getAllInternships, getInternship,
  createInternship, updateInternship, deleteInternship
} = require("../controllers/internship.controller");
const { protect, requireAdmin, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

// Public — students browse open internships
router.get("/",    protect, getInternships);
router.get("/:id", protect, getInternship);

// Admin — see all
router.get("/admin/all", protect, requireAdmin, getAllInternships);

// Company — post/edit/delete their own
router.post(  "/",    protect, requireRole("company"), upload.single("image"), createInternship);
router.put(   "/:id", protect, requireRole("company", "admin"), upload.single("image"), updateInternship);
router.delete("/:id", protect, requireRole("company", "admin"), deleteInternship);

module.exports = router;
