import { defineEventHandler } from "h3";
import { Product } from "@/server/models/product";

export default defineEventHandler(async () => {
  try {
    const products = await Product.find();
    return products;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
