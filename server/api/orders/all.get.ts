import { defineEventHandler } from "h3";
import { Order } from "@/server/models/order";

export default defineEventHandler(async () => {
  try {
    const orders = await Order.find().populate('user', "firstName lastName").populate('bartender', "firstName lastName").populate('products.product');
    return orders;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
