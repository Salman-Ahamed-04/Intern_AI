const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Company = require("../models/Company");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive) return res.status(403).json({ success: false, message: "Account is deactivated" });

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user.toObject();

    // attach profile data
    let profile = null;
    if (user.profileId) {
      if (user.role === "student") profile = await Candidate.findById(user.profileId);
      if (user.role === "company") profile = await Company.findById(user.profileId);
    }

    res.json({ success: true, message: "Login successful", token, user: { ...safeUser, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    const allowedRoles = ["student", "company"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });

    // Create user first
    const user = await User.create({ name, email, password, role: userRole });

    // Auto-create linked profile
    let profile = null;
    if (userRole === "student") {
      const parts = name.trim().split(" ");
      const initials = (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
      const colors = [["#d1fae5","#065f46"],["#dbeafe","#1e40af"],["#fce7f3","#9d174d"],["#fef3c7","#92400e"],["#ede9fe","#5b21b6"]];
      const [avatarColor, avatarTextColor] = colors[Math.floor(Math.random() * colors.length)];
      profile = await Candidate.create({ name, email, initials, avatarColor, avatarTextColor, status: "Active" });
      user.profileId = profile._id;
      user.profileModel = "Candidate";
      await user.save();
    } else if (userRole === "company") {
      profile = await Company.create({ name, email, status: "Active" });
      user.profileId = profile._id;
      user.profileModel = "Company";
      await user.save();
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user.toObject();

    res.status(201).json({ success: true, message: "Account created", token, user: { ...safeUser, profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.profileId) {
      if (req.user.role === "student") profile = await Candidate.findById(req.user.profileId);
      if (req.user.role === "company") profile = await Company.findById(req.user.profileId);
    }
    res.json({ success: true, user: { ...req.user.toObject(), profile } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { login, register, getMe, changePassword };
