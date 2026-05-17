// unseed.js — Run this to REMOVE all seed data from MongoDB
// Usage: node src/data/unseed.js

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User        = require("../models/User");
const Candidate   = require("../models/Candidate");
const Company     = require("../models/Company");
const Application = require("../models/Application");
const Match       = require("../models/Match");
const Interview   = require("../models/Interview");
const Internship  = require("../models/Internship");

const unseed = async () => {
  await connectDB();

  console.log("🗑️  Removing all seed data from database...\n");

  const results = await Promise.all([
    User.deleteMany({}),
    Candidate.deleteMany({}),
    Company.deleteMany({}),
    Application.deleteMany({}),
    Match.deleteMany({}),
    Interview.deleteMany({}),
    Internship.deleteMany({}),
  ]);

  const [users, candidates, companies, applications, matches, interviews, internships] = results;

  console.log(`✅ Users deleted:        ${users.deletedCount}`);
  console.log(`✅ Candidates deleted:   ${candidates.deletedCount}`);
  console.log(`✅ Companies deleted:    ${companies.deletedCount}`);
  console.log(`✅ Applications deleted: ${applications.deletedCount}`);
  console.log(`✅ Matches deleted:      ${matches.deletedCount}`);
  console.log(`✅ Interviews deleted:   ${interviews.deletedCount}`);
  console.log(`✅ Internships deleted:  ${internships.deletedCount}`);

  console.log("\n🎉 Database cleared! Your app will now only show real data.");
  console.log("   You can register new accounts at /register\n");

  await mongoose.disconnect();
  process.exit(0);
};

unseed().catch((err) => {
  console.error("❌ Unseed error:", err);
  process.exit(1);
});
