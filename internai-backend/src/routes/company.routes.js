const router = require("express").Router();
const {
  getCompanies, getCompany, createCompany, updateCompany, deleteCompany,
  getPendingCompanies, approveCompany
} = require("../controllers/company.controller");
const { protect, requireAdmin } = require("../middleware/auth.middleware");

router.use(protect);
router.get("/pending", requireAdmin, getPendingCompanies);
router.put("/:id/approve", requireAdmin, approveCompany);
router.route("/").get(getCompanies).post(createCompany);
router.route("/:id").get(getCompany).put(updateCompany).delete(deleteCompany);

module.exports = router;
