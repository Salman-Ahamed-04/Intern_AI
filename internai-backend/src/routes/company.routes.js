const router = require("express").Router();
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } = require("../controllers/company.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.route("/").get(getCompanies).post(createCompany);
router.route("/:id").get(getCompany).put(updateCompany).delete(deleteCompany);
module.exports = router;
