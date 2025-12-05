import type { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { prisma } from "~/server/utils/prisma";
// import type { PaymentMethod } from "@prisma/client";

export interface SeederCounts {
  users?: number;
  categories?: number;
  products?: number;
  orders?: number;
  roles?: number;
}

export interface SeederResult {
  users: any[];
  categories: any[];
  products: any[];
  orders: any[];
  roles: any[];
}

export async function clearDatabase() {
  try {
    // Respect FK constraints: delete dependent records first
    await prisma.log.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.raise.deleteMany();
    await prisma.productOnCategory.deleteMany();
    await prisma.purchase.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.customRole.deleteMany();
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function seedDatabase(
  inputCounts: SeederCounts = {}
): Promise<SeederResult> {
  try {
    // Default counts if not provided, then merge with overrides
    const finalCounts = {
      users: 10,
      categories: 5,
      products: 20,
      orders: 150,
      roles: 3,
      ...inputCounts,
    };

    // Clear existing data
    await clearDatabase();

    // Seed roles
    console.log("Seeding roles...");
    const roleData: Prisma.CustomRoleCreateInput[] = [
      { roleName: "admin", roleDescription: "Administrator with full access" },
      { roleName: "user", roleDescription: "Regular user with basic access" },
      { roleName: "cashier", roleDescription: "Can process orders" },
    ].slice(0, finalCounts.roles ?? 3);

    const createdRoles = await Promise.all(
      roleData.map((data) => prisma.customRole.create({ data }))
    );
    console.log(`Seeded ${createdRoles.length} roles`);

    // Seed users
    console.log("Seeding users...");
    const hashedDefault = await hash("password123", 10);
    const adminPassword = await hash("admin123", 10);

    const adminRole = createdRoles.find((r) => r.roleName === "admin") || null;
    const userRole = createdRoles.find((r) => r.roleName === "user") || null;

    const createdUsers = [] as any[];
    const adminUser = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: adminPassword,
        firstName: "Admin",
        lastName: "User",
        balance: 1000,
        active: true,
        role: adminRole ? { connect: { id: adminRole.id } } : undefined,
      },
    });
    createdUsers.push(adminUser);

    const toCreate = Math.max((finalCounts.users ?? 10) - 1, 0);
    for (let i = 0; i < toCreate; i++) {
      const u = await prisma.user.create({
        data: {
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: hashedDefault,
          firstName: `User${i + 1}`,
          lastName: "Test",
          balance: Math.floor(Math.random() * 1000),
          active: true,
          role: userRole ? { connect: { id: userRole.id } } : undefined,
        },
      });
      createdUsers.push(u);
    }
    console.log(`Seeded ${createdUsers.length} users`);

    // Seed categories
    console.log("Seeding categories...");
    const categoryData: Prisma.CategoryCreateInput[] = [
      { name: "Dranken", ageRestriction: true },
      { name: "Snoep", ageRestriction: false },
      { name: "Snacks", ageRestriction: false },
      { name: "Broodjes", ageRestriction: false },
      { name: "Overig", ageRestriction: false },
    ].slice(0, finalCounts.categories ?? 5);

    const createdCategories = await Promise.all(
      categoryData.map((data) => prisma.category.create({ data }))
    );
    console.log(`Seeded ${createdCategories.length} categories`);

    // Seed products
    console.log("Seeding products...");
    const baseProducts = [
      {
        name: "Cola",
        description: "Frisdrank",
        price: 150,
        categoryIndex: 0,
        stock: 100,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Bier",
        description: "Alcoholische drank",
        price: 250,
        categoryIndex: 0,
        stock: 50,
        ageRestriction: true,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Mars",
        description: "Chocoladereep",
        price: 100,
        categoryIndex: 1,
        stock: 75,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Chips",
        description: "Zoute snack",
        price: 125,
        categoryIndex: 2,
        stock: 60,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
    ].slice(0, finalCounts.products ?? 20);

    const createdProducts = [] as any[];
    for (const p of baseProducts) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          ageRestriction: p.ageRestriction,
          imageUrl: p.imageUrl,
        },
      });
      createdProducts.push(product);

      const cat = createdCategories[p.categoryIndex];
      if (cat) {
        await prisma.productOnCategory.create({
          data: { productId: product.id, categoryId: cat.id },
        });
      }
    }
    console.log(`Seeded ${createdProducts.length} products`);

    // Seed orders
    console.log("Seeding orders...");
    const createdOrders = [] as any[];
    const ordersToCreate = finalCounts.orders ?? 150;
    for (let i = 0; i < ordersToCreate; i++) {
      const user =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const product =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const count = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const total = product.price * count;

      // 8 AM rule for Amsterdam timezone equivalent simplified (use system time)
      const now = new Date();
      const dayOfOrder = new Date(now);
      if (dayOfOrder.getHours() < 8) {
        dayOfOrder.setDate(dayOfOrder.getDate() - 1);
      }
      dayOfOrder.setHours(0, 0, 0, 0);

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          bartenderId: createdUsers[0].id,
          total,
          dayOfOrder,
          items: {
            create: [
              {
                productId: product.id,
                count,
              },
            ],
          },
        },
        include: { items: true },
      });
      createdOrders.push(order);

      // Update product metrics
      const recentOrdersArr: any[] = product.recentOrders
        ? JSON.parse(product.recentOrders as unknown as string)
        : [];
      recentOrdersArr.push({ date: new Date().toISOString(), quantity: count });

      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const pruned = recentOrdersArr.filter(
        (o: any) => new Date(o.date) >= thirtyDaysAgo
      );
      const recentQuantity = pruned.reduce(
        (sum: number, o: any) => sum + (o.quantity || 0),
        0
      );
      const popularityScore =
        recentQuantity * 0.7 + (product.totalQuantitySold + count) * 0.3;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          totalOrders: { increment: 1 },
          totalQuantitySold: { increment: count },
          stock: { decrement: count },
          recentOrders: JSON.stringify(pruned),
          popularityScore,
        },
      });
      // Also update local product copy for subsequent iterations
      product.totalOrders += 1;
      product.totalQuantitySold += count;
      product.stock -= count;
      product.recentOrders = JSON.stringify(pruned) as unknown as any;
      product.popularityScore = popularityScore;
    }
    console.log(`Seeded ${createdOrders.length} orders`);

    return {
      users: createdUsers,
      categories: createdCategories,
      products: createdProducts,
      orders: createdOrders,
      roles: createdRoles,
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
