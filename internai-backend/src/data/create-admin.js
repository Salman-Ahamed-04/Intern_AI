require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const email    = "admin@internai.edu";
  const password = "admin123";
  const name     = "Admin User";

  // Delete existing broken admin first
  await User.deleteOne({ email });

  // Let the User model's pre-save hook hash the password
  const user = new User({ name, email, password, role: "admin", isActive: true });
  await user.save();

  console.log("✅ Admin created!");
  console.log("   Email:   ", email);
  console.log("   Password:", password);
  process.exit(0);
};

run().catch(console.error);