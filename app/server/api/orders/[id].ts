import { defineEventHandler, createError } from "h3";

export default defineEventHandler(async (event) => {
  // Extract order id from route params
  const { id } = event.context.params || {};

  if (!id) {
    throw createError({ statusCode: 400, message: "Order ID is required" });
  }

  // Import model
  const { Order } = await import("../../models/order");

  try {
    // Find order by id
    const order = await Order.findById(id)
      .populate("user", "firstName lastName")
      .populate("bartender", "firstName lastName")
      .populate("products.productId", "name price");
    if (!order) {
      throw createError({ statusCode: 404, message: "Order not found" });
    }
    // Populate related fields
    return order;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Error retrieving order " + error,
    });
  }
});
