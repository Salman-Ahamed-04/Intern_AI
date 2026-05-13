const Internship = require("../models/Internship");
const { cloudinary } = require("../config/cloudinary");

const getInternships = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status, type, companyId } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    else query.status = "Open";
    if (type && type !== "All") query.type = type;
    if (companyId) query.companyId = companyId;
    query.approvalStatus = "approved";
    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
        { skills:      { $regex: search, $options: "i" } },
      ];
    }
    const total = await Internship.countDocuments(query);
    const data  = await Internship.find(query)
      .populate("companyId", "name industry location website")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllInternships = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status, companyId } = req.query;
    const query = {};
    if (status && status !== "All") query.status = status;
    if (companyId) query.companyId = companyId;
    if (search) {
      query.$or = [
        { title:    { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    const total = await Internship.countDocuments(query);
    const data  = await Internship.find(query)
      .populate("companyId", "name industry")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate("companyId", "name industry location website email phone description openRoles totalHires");
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    res.json({ success: true, data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createInternship = async (req, res) => {
  try {
    const { title, description, requirements, location, type, duration, stipend, skills, deadline, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    const companyId = req.user.profileId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company profile not found" });
    const Company = require("../models/Company");
    const company = await Company.findById(companyId);
    if (!company || company.approvalStatus !== "approved") {
      return res.status(403).json({ success: false, message: "Your company account must be approved by admin before posting internships" });
    }
    const skillsArr = typeof skills === "string"
      ? skills.split(",").map(s => s.trim()).filter(Boolean)
      : (skills || []);
    const internship = await Internship.create({
      companyId, title, description, requirements, location, type, duration, stipend,
      skills: skillsArr, deadline, status: status || "Open",
      imageUrl:       req.file ? req.file.path     : "",
      imagePublicId:  req.file ? req.file.filename  : "",
      approvalStatus: "pending",
    });
    res.status(201).json({ success: true, message: "Internship submitted for admin approval", data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    if (req.user.role !== "admin" && String(internship.companyId) !== String(req.user.profileId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const updates = { ...req.body };
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (req.file) {
      if (internship.imagePublicId) {
        await cloudinary.uploader.destroy(internship.imagePublicId).catch(() => {});
      }
      updates.imageUrl      = req.file.path;
      updates.imagePublicId = req.file.filename;
    }
    const updated = await Internship.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: "Internship updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    if (req.user.role !== "admin" && String(internship.companyId) !== String(req.user.profileId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (internship.imagePublicId) {
      await cloudinary.uploader.destroy(internship.imagePublicId).catch(() => {});
    }
    await Internship.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Internship deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPendingInternships = async (req, res) => {
  try {
    const data = await Internship.find({ approvalStatus: "pending" })
      .populate("companyId", "name industry")
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveInternship = async (req, res) => {
  try {
    const { approvalStatus, approvalNote } = req.body;
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: "approvalStatus must be approved or rejected" });
    }
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { approvalStatus, approvalNote: approvalNote || "" },
      { new: true }
    );
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    res.json({ success: true, message: "Internship " + approvalStatus, data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInternships, getAllInternships, getInternship,
  createInternship, updateInternship, deleteInternship,
  getPendingInternships, approveInternship
};
