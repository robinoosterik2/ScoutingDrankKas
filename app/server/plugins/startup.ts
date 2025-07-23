import { connectDB } from "@/utils/mongoose";
import User from "../models/user";
import mongoose from "mongoose";
// import { MongoBackupService } from "./cron/backup";

// const backupConfig = {
//   mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
//   backupDir: '/backup',
//   retentionDays: 3000,
//   enableCompression: true
// };
// const backupService = new MongoBackupService(backupConfig);
// const scheduler = new BackupScheduler(backupService);

export default defineNitroPlugin(async (nitroApp) => {
  // if (process.env.NODE_ENV !== "development") {
  //   scheduler.start();
  // }

  // Check for required environment variables
  if (!process.env.MONGODB_URI) {
    console.error("Startup plugin: MONGODB_URI is not defined");
    return;
  }

  // Connect to MongoDB
  try {
    await connectDB(process.env.MONGODB_URI);
    console.log("Startup plugin: Using centralized MongoDB connection.");
  } catch (error) {
    console.error(
      "Startup plugin: Error connecting to MongoDB (centralized):",
      error
    );
    return;
  }

  try {
    console.log("Startup plugin: Proceeding with admin role and user setup...");
    const { CustomRole } = await import("../models/customRole");
    const adminEmail = process.env.ADMIN_EMAIL || "robinoosterik03@gmail.com";

    // eslint-disable-next-line prefer-const
    let [adminRole, adminUser] = await Promise.all([
      CustomRole.findOne({ roleName: "admin" }),
      User.findOne({ email: adminEmail }),
    ]);

    // If both exist, we're done
    if (adminRole && adminUser) {
      console.log(
        "Startup plugin: Admin role and user already exist, skipping setup"
      );
      return;
    }

    // Setup admin role
    if (!adminRole) {
      console.log("Startup plugin: Creating admin role...");
      adminRole = new CustomRole({
        roleName: "admin",
        roleDescription: "Administrator with full access",
        rolePermissions: ["admin"],
      });
      await adminRole.save();
      console.log("Startup plugin: Admin role created successfully");
    }

    // Setup admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    await User.deleteOne({ email: adminEmail });
    if (!adminUser) {
      console.log(
        "Startup plugin: Force deleting and recreating admin user..."
      );
      const hashedPassword = await hashPassword(adminPassword);

      // Use save() instead of insertOne for better error handling and middleware
      await User.collection.insertOne({
        email: adminEmail,
        username: "admin",
        firstName: "Admin",
        lastName: "User",
        password: hashedPassword,
        role: adminRole._id,
        active: true,
        balance: 0,
        loggedInAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Startup plugin: Admin user created successfully");
    } else {
      console.log("Startup plugin: Admin user already exists");
    }

    console.log("Startup plugin: Admin setup completed.");
  } catch (error) {
    console.error("Startup plugin: Error during admin setup:", error);
    // Don't set the flag if setup fails, allowing retry on next restart

    // In production, you might want to exit the process on critical failures
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Startup plugin: Critical failure in production, consider manual intervention"
      );
    }
  }
});
