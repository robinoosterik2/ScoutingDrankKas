import { defineEventHandler, getQuery } from "h3";
import { Order } from "@/server/models/order";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { userId, month, year } = query;
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;

  if (!userId || !month || !year) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID, month, and year are required",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const [orders, total] = await Promise.all([
    Order.find({
      user: userId,
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({
      user: userId,
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      },
    }),
  ]);

  return {
    orders,
    total,
  };
});
