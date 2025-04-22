import { defineEventHandler, readBody } from "h3";
import { User } from "@/server/models/user";
import { faker } from "@faker-js/faker";

export default defineEventHandler(async (event) => {
  try {
    const { total } = event.context.params || {};

    const users = [];
    for (let i = 0; i < Number(total); i++) {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const user = new User({
        email: faker.internet.email(),
        username: firstName+lastName,
        firstName: firstName,
        lastName: lastName,
        password: faker.internet.password({ length: 8 }), // Ensure password meets your requirements
      });
      users.push(user);
    }

    // Save users to the database
    await User.insertMany(users);
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
});
