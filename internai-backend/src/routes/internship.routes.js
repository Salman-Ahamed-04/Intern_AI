const router = require("express").Router();
const {
  getInternships, getAllInternships, getInternship,
  createInternship, updateInternship, deleteInternship,
  getPendingInternships, approveInternship
} = require("../controllers/internship.controller");
const { protect, requireAdmin, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

// Specific paths MUST come before /:id
router.get("/",              protect, getInternships);
router.get("/admin/all",     protect, requireAdmin, getAllInternships);
router.get("/admin/pending", protect, requireAdmin, getPendingInternships);

// Company create
router.post("/", protect, requireRole("company"), upload.single("image"), createInternship);

// Parameterised routes last
router.get(   "/:id",         protect, getInternship);
router.put(   "/:id/approve", protect, requireAdmin, approveInternship);
router.put(   "/:id",         protect, requireRole("company", "admin"), upload.single("image"), updateInternship);
router.delete("/:id",         protect, requireRole("company", "admin"), deleteInternship);

module.exports = router;
