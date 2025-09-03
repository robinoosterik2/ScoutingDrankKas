import { defineEventHandler, readBody } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { id, email, username, firstName, lastName, role } = body;

    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!user) {
      throw new Error("User not found");
    }

    // check if unique email, username (first and last name are not unique)
    if (user.email !== email) {
      const existingUserByEmail = await prisma.user.findFirst({ where: { email } });
      if (existingUserByEmail) {
        throw new Error("User with this email already exists");
      }
    }
    if (user.username !== username) {
      const existingUserByUsername = await prisma.user.findFirst({ where: { username } });
      if (existingUserByUsername) {
        throw new Error("User with this username already exists");
      }
    }
    const roleObject = role ? await prisma.customRole.findUnique({ where: { id: Number(role) } }) : null;
    if (role && !roleObject) {
      throw createError("Error updating user, invalid role");
    }

    if (user.firstName !== firstName || user.lastName !== lastName) {
      const existingUserByFirstAndLastName = await prisma.user.findFirst({
        where: { firstName, lastName },
      });
      if (existingUserByFirstAndLastName) {
        throw new Error("User with this first and last name already exists");
      }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: email || user.email,
        username: username || user.username,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        roleId: roleObject ? roleObject.id : user.roleId,
      },
    });

    return { message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    throw createError("Error updating user");
  }
});
