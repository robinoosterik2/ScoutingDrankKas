import { defineEventHandler, getQuery } from "h3";
import { Order } from "@/server/models/order";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);

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

  const orders = await Order.aggregate([
    { $match: { user: user.id } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        total: { $sum: "$total" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
  return orders.map((order) => ({
    month: order._id.month,
    year: order._id.year,
    total: order.total,
    count: order.count,
  }));
});
