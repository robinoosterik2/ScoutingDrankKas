import prisma from "~/server/utils/prisma";

// Note: hashPassword is provided by nuxt-auth-utils globally.
// We call it directly to avoid duplicating hashing logic.

export default defineNitroPlugin(async () => {
  try {
    console.log("Startup: Prisma initialized. Ensuring admin role and user...");

    const adminEmail = process.env.ADMIN_EMAIL || "robinoosterik03@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";

    // Ensure admin role exists (with 'admin' permission)
    const role = await prisma.customRole.upsert({
      where: { roleName: "admin" },
      update: {},
      create: {
        roleName: "admin",
        roleDescription: "Administrator with full access",
        rolePermissions: JSON.stringify(["admin"]),
      },
    });

    // Ensure admin user exists. We don't try to preserve any legacy user IDs.
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    const hashed = await hashPassword(adminPassword);

    if (!existing) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          username: "admin",
          firstName: "Admin",
          lastName: "User",
          password: hashed,
          active: true,
          balance: 0,
          loggedInAt: new Date(),
          role: { connect: { id: role.id } },
        },
      });
      console.log("Startup: Admin user created.");
    } else {
      // Keep email as the identifier; update other fields to ensure consistency
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: existing.username || "admin",
          firstName: existing.firstName || "Admin",
          lastName: existing.lastName || "User",
          role: { connect: { id: role.id } },
        },
      });
      console.log("Startup: Admin user already exists; ensured role.");
    }

    console.log("Startup: Admin setup completed.");
  } catch (error) {
    console.error("Startup: Error ensuring admin setup:", error);
    if (process.env.NODE_ENV === "production") {
      console.error("Startup: Please verify DB connectivity and schema.");
    }
  }
});
