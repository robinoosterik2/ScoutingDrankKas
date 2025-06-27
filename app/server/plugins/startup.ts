import { connectDB } from "@/utils/mongoose";
// import { MongoBackupService } from "./cron/backup";

// Define a unique symbol for the flag
const adminSetupDoneFlag = Symbol.for("nitro.adminSetupDone");

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

  if (!process.env.MONGODB_URI) {
    console.error("Startup plugin: MONGODB_URI is not defined");
    return;
  }

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

  // @ts-expect-error - Check if the flag is already set
  if (nitroApp[adminSetupDoneFlag]) {
    console.log("Startup plugin: Admin setup already done.");
    return;
  }

  try {
    console.log("Startup plugin: Proceeding with admin role and user setup...");
    // Import models only after connection is confirmed
    const { CustomRole } = await import("../models/customRole");
    const { User } = await import("../models/user");
    // hashPassword should be auto-imported by nuxt-auth-utils on the server-side

    let adminRole = await CustomRole.findOne({ roleName: "admin" });

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

    let adminUser = await User.findOne({ email: "robinoosterik03@gmail.com" });

    if (!adminUser) {
      console.log("Startup plugin: Creating admin user...");
      const hashedPassword = await hashPassword("admin"); // Provided by nuxt-auth-utils

      adminUser = new User({
        email: "robinoosterik03@gmail.com",
        username: "admin",
        firstName: "admin",
        lastName: "admin",
        password: hashedPassword,
        role: adminRole._id, // Ensure adminRole is defined (it will be, from findOne or new)
      });

      await User.collection.insertOne(adminUser);
      console.log("Startup plugin: Admin user created successfully");
    }

    // @ts-expect-error - Set the flag on nitroApp after successful setup
    nitroApp[adminSetupDoneFlag] = true;
    console.log("Startup plugin: Admin setup performed and flag set.");
  } catch (error) {
    console.error("Startup plugin: Error during admin setup:", error);
    // Do not set the flag if setup fails, so it might be retried on a subsequent HMR,
    // or log this as a critical failure.
  }
});
