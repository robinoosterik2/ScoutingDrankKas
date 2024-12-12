import { defineEventHandler } from "h3";
import { Order } from "@/server/models/order";

export default defineEventHandler(async () => {
  try {
    const orders = await Order.find();
    return orders;
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Error while fetching custom roles"});
  }
});
