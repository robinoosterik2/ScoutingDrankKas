import { defineEventHandler, createError } from "h3";
import User from "@/server/models/user";
import { CustomRole } from "@/server/models/customRole";
import fs from "fs";

export default defineEventHandler(async (_event) => {
  try {
    const users = await User.find().lean();
    const roles = await CustomRole.find().lean();
    fs.writeFileSync("./db_backup/users.json", JSON.stringify(users, null, 4));
    fs.writeFileSync("./db_backup/roles.json", JSON.stringify(roles, null, 4));
    return "Data exported successfully";
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while exporting data " + error,
    });
  }
});
