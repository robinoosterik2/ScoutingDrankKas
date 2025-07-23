import Log from "@/server/models/log";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const logs = await Log.find()
      .populate("executor", "username")
      .populate("objectId", "name");
    return logs;
  } catch (error) {
    event.res.statusCode = 500;
    return { error: "Failed to fetch logs" };
  }
});
