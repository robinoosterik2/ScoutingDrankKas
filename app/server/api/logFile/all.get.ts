import { defineEventHandler, createError } from "h3";
import Log from "@/server/models/log";

export default defineEventHandler(async () => {
  try {
    // TODO: Add pagination
    const logs = await Log.find();
    return logs;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching logs " + error,
    });
  }
});
