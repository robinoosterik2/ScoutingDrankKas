import { defineEventHandler, createError } from "h3"; // Ensure createError is imported
import { Category } from "@/server/models/category";

export default defineEventHandler(async () => {
  try {
    const categories = await Category.find().lean(); // Added .lean()
    return categories;
  } catch (error: any) { // Added type for error
    console.error("Error fetching categories:", error); // Log the actual error
    throw createError({
        statusCode: 500,
        statusMessage: "Error while fetching categories", // Corrected error message
        message: "An unexpected error occurred while fetching category data." // More detailed message
    });
  }
});
