import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/userSchema.js";

dotenv.config();

const seedAdmin = async () => {
  try {
   await mongoose.connect(process.env.MONGODB_URL, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
       });

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ Please provide ADMIN_EMAIL and ADMIN_PASSWORD in .env");
      process.exit(1);
    }

    // check if admin already exists
    const existingAdmin = await User.findOne({
      email: adminEmail,
      role: "superAdmin",
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists, skipping seeding process.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = new User({
      username: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "superAdmin",
      isVerified: true, // skip OTP for seeded admin
    });

    await adminUser.save();

    console.log("Super admin created successfully! 👑✅");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
