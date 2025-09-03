import { hash } from "bcryptjs";
import { CustomRole } from "~/server/models/customRole";
import User from "~/server/models/user";
import { Category } from "~/server/models/category";
import { Product } from "~/server/models/product";
import { Order } from "~/server/models/order";

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
    await Promise.all([
      CustomRole.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("Database cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function seedDatabase(
  counts: SeederCounts = {}
): Promise<SeederResult> {
  try {
    // Default counts if not provided
    const counts = {
      users: 10,
      categories: 5,
      products: 20,
      orders: 150,
      roles: 3,
    };

    // Clear existing data
    await clearDatabase();

    // Seed roles
    console.log("Seeding roles...");
    const roleData = [
      { roleName: "admin", roleDescription: "Administrator with full access" },
      { roleName: "user", roleDescription: "Regular user with basic access" },
      { roleName: "cashier", roleDescription: "Can process orders" },
    ].slice(0, counts.roles);

    const createdRoles = await CustomRole.insertMany(roleData);
    console.log(`Seeded ${createdRoles.length} roles`);

    // Seed users
    console.log("Seeding users...");
    const hashedPassword = await hash("password123", 10);
    const adminUser = {
      username: "admin",
      email: "admin@example.com",
      password: await hash("admin123", 10),
      firstName: "Admin",
      lastName: "User",
      balance: 1000,
      active: true,
      role: createdRoles.find((r) => r.roleName === "admin")?._id,
    };

    const testUsers = Array.from({ length: counts.users - 1 }, (_, i) => ({
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      password: hashedPassword,
      firstName: `User${i + 1}`,
      lastName: `Test`,
      balance: Math.floor(Math.random() * 1000),
      active: true,
      role: createdRoles.find((r) => r.roleName === "user")?._id,
    }));

    const createdUsers = await User.insertMany([adminUser, ...testUsers]);
    console.log(`Seeded ${createdUsers.length} users`);

    // Seed categories
    console.log("Seeding categories...");
    const categoryData = [
      { name: "Dranken", ageRestriction: true },
      { name: "Snoep", ageRestriction: false },
      { name: "Snacks", ageRestriction: false },
      { name: "Broodjes", ageRestriction: false },
      { name: "Overig", ageRestriction: false },
    ].slice(0, counts.categories);

    const createdCategories = await Category.insertMany(categoryData);
    console.log(`Seeded ${createdCategories.length} categories`);

    // Seed products
    console.log("Seeding products...");
    const productData = [
      {
        name: "Cola",
        description: "Frisdrank",
        price: 150, // €1.50
        categories: [createdCategories[0]._id],
        stock: 100,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Bier",
        description: "Alcoholische drank",
        price: 250, // €2.50
        categories: [createdCategories[0]._id],
        stock: 50,
        ageRestriction: true,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Mars",
        description: "Chocoladereep",
        price: 100, // €1.00
        categories: [createdCategories[1]._id],
        stock: 75,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
      {
        name: "Chips",
        description: "Zoute snack",
        price: 125, // €1.25
        categories: [createdCategories[2]._id],
        stock: 60,
        ageRestriction: false,
        imageUrl: "/images/placeholder.jpg",
      },
    ].slice(0, counts.products);

    const createdProducts = await Product.insertMany(productData);
    console.log(`Seeded ${createdProducts.length} products`);

    // Seed orders
    console.log("Seeding orders...");
    const orderData = Array.from({ length: counts.orders }, () => {
      const user =
        createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const product =
        createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const count = Math.floor(Math.random() * 3) + 1; // 1-3 items
      const total = product.price * count;

      return {
        user: user._id,
        products: [
          {
            product: product._id,
            count,
          },
        ],
        total,
        bartender: createdUsers[0]._id, // Admin user as bartender
      };
    });

    const createdOrders = await Order.insertMany(orderData);
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
