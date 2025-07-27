import { defineEventHandler, getQuery } from "h3";
import { Order } from "~~/server/models/order";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string | undefined;

    const queryFilter = userId ? { user: userId } : {};

    const recentOrders = await Order.find(queryFilter)
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(3) // Limit to 3 most recent orders
      .populate({
        path: "user",
        select: "firstName lastName",
      })
      .populate({
        path: "products.productId",
        select: "name price",
      });

    return { orders: recentOrders };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch recent orders",
    });
  }
});
