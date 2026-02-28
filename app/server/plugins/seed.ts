import { prisma } from "~/server/utils/prisma";

export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  // Seed roles first so we can assign them to users
  console.log("Seeding roles...");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const rolesPath = path.resolve(process.cwd(), "utils/roles.csv");
  if (fs.existsSync(rolesPath)) {
    const fileContent = fs.readFileSync(rolesPath, "utf-8");
    const lines = fileContent
      .split("\n")
      .filter((l) => l.trim() !== "" && !l.startsWith("#"));

    for (const line of lines) {
      const [roleName, roleDescription, rolePermissions] = line.split(",");
      if (!roleName) continue;

      await prisma.customRole.upsert({
        where: { roleName: roleName.trim() },
        update: {
          roleDescription: roleDescription ? roleDescription.trim() : "",
          rolePermissions: rolePermissions ? rolePermissions.trim() : "",
        },
        create: {
          roleName: roleName.trim(),
          roleDescription: roleDescription ? roleDescription.trim() : "",
          rolePermissions: rolePermissions ? rolePermissions.trim() : "",
        },
      });
      console.log(`Seeded role: ${roleName}`);
    }
  }

  const userCount = await prisma.user.count();
  if (userCount <= 1) {
    console.log("Seeding users...");

    // Read users.csv
    const usersPath = path.resolve(process.cwd(), "utils/users.csv");
    if (fs.existsSync(usersPath)) {
      const fileContent = fs.readFileSync(usersPath, "utf-8");
      const lines = fileContent
        .split("\n")
        .filter((l) => l.trim() !== "" && !l.startsWith("#"));

      for (const line of lines) {
        const [username, balance, roleName] = line.split(",");
        if (!username || !balance) continue;

        const normalizedUsername = username.trim();

        const existingUser = await prisma.user.findFirst({
          where: { username: normalizedUsername.toLowerCase() },
        });

        if (!existingUser) {
          const settings = await prisma.settings.create({
            data: { language: "nl", darkMode: true, speedMode: false },
          });

          let roleId = null;
          if (roleName) {
            const role = await prisma.customRole.findUnique({
              where: { roleName: roleName.trim() },
            });
            if (role) {
              roleId = role.id;
            }
          }

          await prisma.user.create({
            data: {
              username: normalizedUsername.toLowerCase(),
              balance: parseInt(balance),
              accountStatus: "MIGRATED",
              active: true,
              settingsId: settings.id,
              roleId: roleId,
            },
          });
          console.log(
            `Created user: ${normalizedUsername} with role ${
              roleName || "none"
            }`
          );
        }
      }
    } else {
      console.warn("app/utils/users.csv not found");
    }
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log("Seeding products...");
    const fs = await import("node:fs");
    const path = await import("node:path");

    const productsPath = path.resolve(process.cwd(), "utils/products.csv");
    if (fs.existsSync(productsPath)) {
      const fileContent = fs.readFileSync(productsPath, "utf-8");
      const lines = fileContent
        .split("\n")
        .filter((l) => l.trim() !== "" && !l.startsWith("Category")); // Skip header

      // Cache categories to avoid creating duplicates in loop
      const categoryMap = new Map<string, string>(); // Name -> ID

      for (const line of lines) {
        // Category,Product,Price,ageRestriction,packSize
        const [
          categoryName,
          productName,
          price,
          ageRestrictionStr,
          packSizeStr,
        ] = line.split(",");
        if (!categoryName || !productName) continue;

        let categoryId = categoryMap.get(categoryName);
        if (!categoryId) {
          // Try find in DB
          let category = await prisma.category.findUnique({
            where: { name: categoryName },
          });
          if (!category) {
            category = await prisma.category.create({
              data: {
                name: categoryName,
                ageRestriction: ageRestrictionStr === "true",
              },
            });
            console.log(`Created category: ${categoryName}`);
          }
          categoryId = category.id;
          categoryMap.set(categoryName, categoryId);
        }

        // Create Product
        // Price in CSV is 1.20, DB is Int (cents likely).
        // Product Edit Logic: "price": 120
        // Need to multiply by 100 if CSV is in euros. CSV looks like "1.20".

        const priceCents = price ? Math.round(parseFloat(price) * 100) : 0;

        const product = await prisma.product.create({
          data: {
            name: productName,
            description: productName, // Default description
            price: priceCents,
            ageRestriction: ageRestrictionStr === "true",
            packSize: packSizeStr ? parseInt(packSizeStr) : null,
            stock: 0,
            imageUrl: "/images/placeholder.jpg",
          },
        });

        // Link Product to Category
        await prisma.productOnCategory.create({
          data: {
            productId: product.id,
            categoryId: categoryId,
          },
        });
        console.log(`Created product: ${productName}`);
      }
    }
  }
});
