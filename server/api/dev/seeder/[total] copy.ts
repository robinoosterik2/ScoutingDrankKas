// import mongoose from "mongoose";
// import { faker } from "@faker-js/faker";
// import { User } from "@/server/models/user";
// import { CustomRole } from "@/server/models/customRole";

// // Seeder function to create multiple users
// export async function seedUsers(total: number = 10) {
//   // Ensure database connection
//   if (mongoose.connection.readyState !== 1) {
//     throw new Error("Database not connected. Please connect to MongoDB first.");
//   }

//   // First, ensure we have some roles to assign
//   const roles = await ensureRoles();

//   // Array to store created users
//   const usersToCreate = [];

//   // Generate users
//   for (let i = 0; i < total; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const username = faker.internet
//       .userName({
//         firstName: firstName,
//         lastName: lastName,
//       })
//       .toLowerCase();

//     const userData = {
//       email: faker.internet
//         .email({
//           firstName: firstName,
//           lastName: lastName,
//         })
//         .toLowerCase(),
//       username: username,
//       firstName: firstName,
//       lastName: lastName,
//       password: faker.internet.password({
//         length: 12,
//         pattern:
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
//       }),
//       role: getRandomRole(roles),
//       loggedInAt: faker.date.recent(),
//     };

//     usersToCreate.push(userData);
//   }

//   // Create users with hashed passwords
//   const createdUsers = [];
//   for (const userData of usersToCreate) {
//     try {
//       // Hash the password before creating the user
//       const hashedPassword = await hashPassword(userData.password);

//       const user = new User({
//         ...userData,
//         password: hashedPassword,
//       });

//       await user.save();
//       createdUsers.push(user);
//     } catch (error) {
//       console.error("Error creating user:", error);
//     }
//   }

//   return createdUsers;
// }

// // Ensure basic roles exist
// async function ensureRoles() {
//   const roleNames = ["Admin", "User", "Moderator"];
//   const existingRoles = await CustomRole.find({ roleName: { $in: roleNames } });
//   const existingRoleNames = existingRoles.map((role) => role.roleName);

//   const rolesToCreate = roleNames
//     .filter((roleName) => !existingRoleNames.includes(roleName))
//     .map((roleName) => ({ roleName }));

//   if (rolesToCreate.length > 0) {
//     await CustomRole.create(rolesToCreate);
//   }

//   return CustomRole.find({ roleName: { $in: roleNames } });
// }

// // Helper to get a random role
// function getRandomRole(roles: any[]) {
//   // Slightly bias towards 'User' role
//   const weightedRoles = [
//     ...roles,
//     roles.find((role) => role.roleName === "User"),
//   ];

//   return weightedRoles[Math.floor(Math.random() * weightedRoles.length)]._id;
// }

// // Example usage in a Nuxt/Node.js server route
// export default defineEventHandler(async (event) => {
//   const { total } = event.context.params || {};

//   try {
//     const users = await seedUsers(Number(total));
//     return {
//       message: `Successfully created ${users.length} users`,
//       users: users.map((user) => ({
//         id: user._id,
//         email: user.email,
//         username: user.username,
//       })),
//     };
//   } catch (error) {
//     console.error("Seeding error:", error);
//     return {
//       error: "Failed to seed users",
//       details: error instanceof Error ? error.message : "Unknown error",
//     };
//   }
// });
