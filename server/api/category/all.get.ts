import { defineEventHandler } from "h3";
import { Category } from "@/server/models/category";

export default defineEventHandler(async () => {
  try {
    const categories = await Category.find();
    return categories;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
