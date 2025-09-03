import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";
import { faker } from "@faker-js/faker";

export default defineEventHandler(async (event) => {
  try {
    const { total } = event.context.params || {};

    const users = [] as any[];
    for (let i = 0; i < Number(total); i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      users.push({
        email: faker.internet.email(),
        username: (firstName + lastName).toLowerCase(),
        firstName,
        lastName,
        password: await hashPassword(faker.internet.password({ length: 8 })),
        active: true,
      });
    }

    await prisma.user.createMany({ data: users });
    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
});
