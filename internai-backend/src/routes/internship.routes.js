const router = require("express").Router();
const {
  getInternships, getAllInternships, getInternship,
  createInternship, updateInternship, deleteInternship,
  getPendingInternships, approveInternship
} = require("../controllers/internship.controller");
const { protect, requireAdmin, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

// Students browse approved open internships
router.get("/",    protect, getInternships);
router.get("/:id", protect, getInternship);

// Admin routes
router.get("/admin/all",     protect, requireAdmin, getAllInternships);
router.get("/admin/pending", protect, requireAdmin, getPendingInternships);
router.put("/:id/approve",   protect, requireAdmin, approveInternship);

// Company routes
router.post(  "/",    protect, requireRole("company"), upload.single("image"), createInternship);
router.put(   "/:id", protect, requireRole("company", "admin"), upload.single("image"), updateInternship);
router.delete("/:id", protect, requireRole("company", "admin"), deleteInternship);

module.exports = router;
