import { defineEventHandler, createError } from "h3"; // Ensure createError is imported
import { Product } from "@/server/models/product";

export default defineEventHandler(async () => {
  try {
    const products = await Product.find().lean(); // Added .lean()
    return products;
  } catch (error: any) { // Added type for error
    console.error("Error fetching products:", error); // Log the actual error
    throw createError({
        statusCode: 500,
        statusMessage: "Error while fetching products", // Corrected error message
        message: "An unexpected error occurred while fetching product data." // More detailed message
    });
  }
});
