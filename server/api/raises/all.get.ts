import { defineEventHandler } from "h3";
import { Raise } from "@/server/models/raise";

export default defineEventHandler(async () => {
  try {
    const raises = await Raise.find();
    return raises;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
