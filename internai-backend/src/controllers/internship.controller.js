const Internship = require("../models/Internship");
const { cloudinary } = require("../config/cloudinary");

// GET /api/internships  — public, students browse
const getInternships = async (req, res) => {
  try {
    const { page = 1, limit = 12, search = "", status, type, companyId } = req.query;
    const query = {};

    if (status && status !== "All") query.status = status;
    else query.status = "Open"; // default: only open ads for students

    if (type && type !== "All") query.type = type;
    if (companyId) query.companyId = companyId;

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

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/internships/all  — admin sees all statuses
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

// GET /api/internships/:id
const getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate("companyId", "name industry location website email phone description");
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });
    res.json({ success: true, data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/internships  — company creates
const createInternship = async (req, res) => {
  try {
    const { title, description, requirements, location, type, duration, stipend, skills, deadline, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const companyId = req.user.profileId;
    if (!companyId) return res.status(400).json({ success: false, message: "Company profile not found" });

    const skillsArr = typeof skills === "string"
      ? skills.split(",").map(s => s.trim()).filter(Boolean)
      : (skills || []);

    const internship = await Internship.create({
      companyId, title, description, requirements, location, type, duration, stipend,
      skills: skillsArr, deadline, status: status || "Open",
      imageUrl:      req.file?.path || "",
      imagePublicId: req.file?.filename || "",
    });

    res.status(201).json({ success: true, message: "Internship posted", data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/internships/:id  — company updates
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ success: false, message: "Internship not found" });

    // Only the owning company or admin can update
    if (req.user.role !== "admin" && String(internship.companyId) !== String(req.user.profileId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const updates = { ...req.body };
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    // New image uploaded — delete old one from Cloudinary
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

// DELETE /api/internships/:id
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

module.exports = { getInternships, getAllInternships, getInternship, createInternship, updateInternship, deleteInternship };
