import { defineEventHandler, readBody } from "h3";
import { User } from "@/server/models/user";
import { CustomRole } from "~/server/models/customRole";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { id, email, username, firstName, lastName, role } = body;

    if (!id) {
      throw new Error("User ID is required");
    }

    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    // check if unique email, username (first and last name are not unique)
    if (user.email !== email) {
      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        throw new Error("User with this email already exists");
      }
    }
    if (user.username !== username) {
      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        throw new Error("User with this username already exists");
      }
    }

    if (role) {
      // check if roles are valid
      const validRole = await CustomRole.findOne({ _id: role });
      if (!validRole) {
        throw createError("Error updating user, invalid role");
      }
    }

    const roleObject = await CustomRole.findOne({ _id: role });

    if (!roleObject) {
      throw createError("Error updating user, invalid role");
    }

    if (user.firstName !== firstName || user.lastName !== lastName) {
      const existingUserByFirstAndLastName = await User.findOne({
        firstName: firstName,
        lastName: lastName,
      });
      if (existingUserByFirstAndLastName) {
        throw new Error("User with this first and last name already exists");
      }
    }

    user.email = email || user.email;
    user.username = username || user.username;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = roleObject._id || user.role;

    await user.save();

    return { message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    throw createError("Error updating user");
  }
});
