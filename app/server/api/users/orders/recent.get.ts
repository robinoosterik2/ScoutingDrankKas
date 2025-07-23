import { defineEventHandler, getQuery } from "h3";
import { Order } from "@/server/models/order";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  const { userId, limit } = getQuery(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 10);
  return orders;
});
