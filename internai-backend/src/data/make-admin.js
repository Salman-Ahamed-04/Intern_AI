require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();
  const email = "your@email.com"; // ← change this to your email
  const user = await User.findOneAndUpdate(
    { email },
    { role: "admin" },
    { new: true }
  );
  if (user) console.log(`✅ ${user.email} is now admin`);
  else console.log("❌ User not found");
  process.exit(0);
};

run().catch(console.error);