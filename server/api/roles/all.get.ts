import { defineEventHandler } from "h3";
import { CustomRole } from "@/server/models/customRole";

export default defineEventHandler(async () => {
  try {
    const customRoles = await CustomRole.find();
    return customRoles;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
