import { defineEventHandler } from "h3";
import { Log } from "@/server/models/log";

export default defineEventHandler(async () => {
  try {
    const logs = await Log.find();
    return logs;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
