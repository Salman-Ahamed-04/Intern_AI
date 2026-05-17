// seed.js — Run once to populate MongoDB with sample data
// Usage: node src/data/seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Company = require("../models/Company");
const Application = require("../models/Application");
const Match = require("../models/Match");
const Interview = require("../models/Interview");
const Internship = require("../models/Internship");

const seed = async () => {
  await connectDB();

  console.log("🌱 Seeding database...");

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Candidate.deleteMany({}),
    Company.deleteMany({}),
    Application.deleteMany({}),
    Match.deleteMany({}),
    Interview.deleteMany({}),
    Internship.deleteMany({}),
  ]);

  // ---- Users ----
  const adminPass = await bcrypt.hash("admin123", 12);
  const staffPass = await bcrypt.hash("staff123", 12);
  await User.insertMany([
    { name: "Admin User", email: "admin@internai.edu", password: adminPass, role: "admin", isActive: true },
    { name: "Staff Member", email: "staff@internai.edu", password: staffPass, role: "staff", isActive: true },
  ]);
  console.log("✅ Users seeded");

  // ---- Companies ----
  const companies = await Company.insertMany([
    { name: "Google", industry: "Technology", location: "Mountain View, CA", website: "https://google.com", email: "intern@google.com", phone: "+1 650-253-0000", description: "World-leading technology company specializing in internet services.", openRoles: 12, totalHires: 45, status: "Active", contactPerson: "Sarah Chen" },
    { name: "Meta", industry: "Technology", location: "Menlo Park, CA", website: "https://meta.com", email: "intern@meta.com", phone: "+1 650-543-4800", description: "Social technology company building the future of connection.", openRoles: 8, totalHires: 32, status: "Active", contactPerson: "John Park" },
    { name: "Figma", industry: "Design Tools", location: "San Francisco, CA", website: "https://figma.com", email: "intern@figma.com", phone: "+1 415-000-1234", description: "Collaborative design platform used by teams worldwide.", openRoles: 5, totalHires: 18, status: "Active", contactPerson: "Lisa Kim" },
    { name: "Stripe", industry: "FinTech", location: "San Francisco, CA", website: "https://stripe.com", email: "intern@stripe.com", phone: "+1 415-000-5678", description: "Global payment infrastructure for the internet.", openRoles: 7, totalHires: 24, status: "Active", contactPerson: "Tom Wilson" },
    { name: "OpenAI", industry: "AI Research", location: "San Francisco, CA", website: "https://openai.com", email: "intern@openai.com", phone: "+1 415-000-9999", description: "AI safety and research company.", openRoles: 10, totalHires: 28, status: "Active", contactPerson: "Maya Patel" },
    { name: "Shopify", industry: "E-Commerce", location: "Ottawa, Canada", website: "https://shopify.com", email: "intern@shopify.com", phone: "+1 613-000-1111", description: "E-commerce platform for businesses of all sizes.", openRoles: 6, totalHires: 20, status: "Active", contactPerson: "Anna White" },
  ]);
  console.log("✅ Companies seeded");

  // ---- Internships ----
  await Internship.insertMany([
    {
      companyId: companies[0]._id, // Google
      title: "Frontend Developer Intern",
      description: "Work on Google's consumer-facing web products using modern React stack.",
      requirements: "Strong React and TypeScript skills required.",
      location: "Mountain View, CA", type: "Hybrid", duration: "3 months", stipend: "$8,000/month",
      skills: ["React", "TypeScript", "GraphQL", "Node.js"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[1]._id, // Meta
      title: "Backend Developer Intern",
      description: "Build scalable backend services for Meta's social platforms.",
      requirements: "Experience with Python and distributed systems.",
      location: "Menlo Park, CA", type: "On-site", duration: "4 months", stipend: "$9,000/month",
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[2]._id, // Figma
      title: "UI/UX Designer Intern",
      description: "Help design the next generation of Figma's collaborative tools.",
      requirements: "Proficiency in Figma and prototyping required.",
      location: "San Francisco, CA", type: "Remote", duration: "3 months", stipend: "$6,000/month",
      skills: ["Figma", "Prototyping", "Illustrator", "Framer"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[3]._id, // Stripe
      title: "Data Analyst Intern",
      description: "Analyze payment trends and build dashboards for Stripe's finance team.",
      requirements: "Strong SQL and Python analytics experience.",
      location: "San Francisco, CA", type: "Hybrid", duration: "3 months", stipend: "$7,500/month",
      skills: ["SQL", "Python", "Tableau", "Excel"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[4]._id, // OpenAI
      title: "ML Research Intern",
      description: "Conduct research on large language models and reinforcement learning.",
      requirements: "Strong ML/DL background with TensorFlow or PyTorch.",
      location: "San Francisco, CA", type: "On-site", duration: "6 months", stipend: "$10,000/month",
      skills: ["ML", "TensorFlow", "Python", "R"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[0]._id, // Google
      title: "DevOps Intern",
      description: "Work on Google Cloud infrastructure and CI/CD pipelines.",
      requirements: "Experience with Kubernetes and cloud platforms.",
      location: "Mountain View, CA", type: "Hybrid", duration: "3 months", stipend: "$8,500/month",
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
      status: "Open", approvalStatus: "approved",
    },
    {
      companyId: companies[5]._id, // Shopify
      title: "Security Analyst Intern",
      description: "Help protect Shopify's platform from security vulnerabilities.",
      requirements: "Knowledge of penetration testing and SIEM tools.",
      location: "Ottawa, Canada", type: "Remote", duration: "3 months", stipend: "$5,500/month",
      skills: ["Pentesting", "SIEM", "Splunk", "Networking"],
      status: "Open", approvalStatus: "approved",
    },
  ]);
  console.log("✅ Internships seeded");
  const candidates = await Candidate.insertMany([
    { name: "Alice Johnson", initials: "AJ", avatarColor: "#e8f5f0", avatarTextColor: "#1a9e75", email: "alice@mit.edu", phone: "+1 555-0101", degree: "MSc Software Engineering", university: "MIT", gpa: 3.9, graduationYear: 2024, skills: ["React", "Node.js", "TypeScript", "GraphQL"], bio: "Passionate frontend developer with internship experience at startups.", status: "Active", matchCount: 4 },
    { name: "David Martinez", initials: "DM", avatarColor: "#fde8d8", avatarTextColor: "#c0502a", email: "david@stanford.edu", phone: "+1 555-0102", degree: "BSc Computer Science", university: "Stanford University", gpa: 3.7, graduationYear: 2024, skills: ["Python", "Django", "PostgreSQL", "Docker"], bio: "Backend developer interested in scalable systems.", status: "Active", matchCount: 3 },
    { name: "Sarah Wilson", initials: "SW", avatarColor: "#fbeaf0", avatarTextColor: "#993556", email: "sarah@risd.edu", phone: "+1 555-0103", degree: "BSc Graphic Design", university: "RISD", gpa: 3.8, graduationYear: 2024, skills: ["Figma", "Illustrator", "Framer", "Prototyping"], bio: "Creative designer with a strong eye for UX.", status: "Placed", matchCount: 6 },
    { name: "Michael Davis", initials: "MD", avatarColor: "#eeedfe", avatarTextColor: "#5356b7", email: "michael@berkeley.edu", phone: "+1 555-0104", degree: "BSc Info Systems", university: "UC Berkeley", gpa: 3.5, graduationYear: 2025, skills: ["SQL", "Tableau", "Python", "Excel"], bio: "Data-driven analyst with strong visualization skills.", status: "Active", matchCount: 2 },
    { name: "Emma Brown", initials: "EB", avatarColor: "#e1f5ee", avatarTextColor: "#0f6e56", email: "emma@harvard.edu", phone: "+1 555-0105", degree: "BSc Data Science", university: "Harvard", gpa: 4.0, graduationYear: 2024, skills: ["ML", "TensorFlow", "Python", "R"], bio: "ML researcher with a published NLP paper.", status: "Active", matchCount: 5 },
    { name: "Liam Turner", initials: "LT", avatarColor: "#fff8e1", avatarTextColor: "#b7860d", email: "liam@cmu.edu", phone: "+1 555-0106", degree: "BSc DevOps", university: "Carnegie Mellon", gpa: 3.6, graduationYear: 2025, skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"], bio: "DevOps engineer passionate about cloud infrastructure.", status: "Interview", matchCount: 3 },
    { name: "James Lewis", initials: "JL", avatarColor: "#f1efe8", avatarTextColor: "#5f5e5a", email: "james@gatech.edu", phone: "+1 555-0107", degree: "MSc Cyber Security", university: "Georgia Tech", gpa: 3.4, graduationYear: 2025, skills: ["Pentesting", "SIEM", "Splunk", "Networking"], bio: "Cybersecurity enthusiast with CTF experience.", status: "Inactive", matchCount: 1 },
  ]);
  console.log("✅ Candidates seeded");

  // ---- Applications ----
  const apps = await Application.insertMany([
    { candidateId: candidates[0]._id, companyId: companies[0]._id, role: "Frontend Dev Intern", status: "Interview", appliedDate: "2024-01-10", notes: "Strong React skills" },
    { candidateId: candidates[1]._id, companyId: companies[1]._id, role: "Backend Developer Intern", status: "In Review", appliedDate: "2024-01-08", notes: "Good Python background" },
    { candidateId: candidates[2]._id, companyId: companies[2]._id, role: "UI/UX Designer Intern", status: "Offer Sent", appliedDate: "2024-01-07", notes: "Excellent portfolio" },
    { candidateId: candidates[3]._id, companyId: companies[3]._id, role: "Data Analyst Intern", status: "Applied", appliedDate: "2024-01-06", notes: "" },
    { candidateId: candidates[4]._id, companyId: companies[4]._id, role: "ML Research Intern", status: "Interview", appliedDate: "2024-01-05", notes: "Published NLP paper" },
    { candidateId: candidates[5]._id, companyId: companies[0]._id, role: "DevOps Intern", status: "Applied", appliedDate: "2024-01-04", notes: "AWS certified" },
    { candidateId: candidates[6]._id, companyId: companies[3]._id, role: "Security Analyst Intern", status: "Rejected", appliedDate: "2024-01-03", notes: "Not enough experience" },
  ]);
  console.log("✅ Applications seeded");

  // ---- Matches ----
  await Match.insertMany([
    { candidateId: candidates[0]._id, companyId: companies[0]._id, role: "Frontend Dev Intern", aiScore: 92, matchedSkills: ["React", "TypeScript"], status: "Interview", acceptedByAdmin: true },
    { candidateId: candidates[1]._id, companyId: companies[1]._id, role: "Backend Developer Intern", aiScore: 88, matchedSkills: ["Python", "Django"], status: "In Review", acceptedByAdmin: true },
    { candidateId: candidates[2]._id, companyId: companies[2]._id, role: "UI/UX Designer Intern", aiScore: 88, matchedSkills: ["Figma", "Prototyping"], status: "Offer Sent", acceptedByAdmin: true },
    { candidateId: candidates[4]._id, companyId: companies[4]._id, role: "ML Research Intern", aiScore: 85, matchedSkills: ["Machine Learning", "TensorFlow"], status: "Interview", acceptedByAdmin: true },
    { candidateId: candidates[5]._id, companyId: companies[0]._id, role: "DevOps Intern", aiScore: 81, matchedSkills: ["AWS", "Kubernetes"], status: "Applied", acceptedByAdmin: false },
    { candidateId: candidates[3]._id, companyId: companies[3]._id, role: "Data Analyst Intern", aiScore: 75, matchedSkills: ["SQL", "Python"], status: "Applied", acceptedByAdmin: false },
    { candidateId: candidates[6]._id, companyId: companies[3]._id, role: "Security Analyst Intern", aiScore: 45, matchedSkills: [], status: "Rejected", acceptedByAdmin: false },
  ]);
  console.log("✅ Matches seeded");

  // ---- Interviews ----
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  await Interview.insertMany([
    { candidateId: candidates[0]._id, companyId: companies[0]._id, applicationId: apps[0]._id, role: "Frontend Dev Intern", scheduledDate: today, scheduledTime: "3:00 PM", type: "Video", interviewer: "Sarah Chen", meetingLink: "https://meet.google.com/abc-def", status: "Scheduled" },
    { candidateId: candidates[5]._id, companyId: companies[0]._id, applicationId: apps[5]._id, role: "DevOps Intern", scheduledDate: today, scheduledTime: "3:30 PM", type: "Video", interviewer: "Tech Corp HR", meetingLink: "https://zoom.us/j/123456", status: "Confirmed" },
    { candidateId: candidates[4]._id, companyId: companies[4]._id, applicationId: apps[4]._id, role: "ML Research Intern", scheduledDate: tomorrow, scheduledTime: "11:00 AM", type: "Onsite", interviewer: "Maya Patel", meetingLink: "", status: "Confirmed" },
    { candidateId: candidates[1]._id, companyId: companies[1]._id, applicationId: apps[1]._id, role: "Backend Developer Intern", scheduledDate: tomorrow, scheduledTime: "3:30 PM", type: "Video", interviewer: "John Park", meetingLink: "https://meet.google.com/xyz-uvw", status: "Pending" },
    { candidateId: candidates[2]._id, companyId: companies[2]._id, applicationId: apps[2]._id, role: "UI/UX Designer Intern", scheduledDate: "2024-01-08", scheduledTime: "1:00 PM", type: "Video", interviewer: "Lisa Kim", meetingLink: "", status: "Completed", feedback: "Excellent portfolio and communication skills.", outcome: "Pass" },
  ]);
  console.log("✅ Interviews seeded");

  console.log("\n🎉 Database seeded successfully!");
  console.log("   Login: admin@internai.edu / admin123");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
