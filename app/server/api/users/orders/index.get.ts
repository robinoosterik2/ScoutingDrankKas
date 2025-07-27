import { defineEventHandler, getQuery, createError } from "h3";
import { Order } from "@/server/models/order";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  const { userId, page = "1", limit = "10", month, year } = getQuery(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Validate that if month is provided, year must also be provided
  if (month && !year) {
    throw createError({
      statusCode: 400,
      statusMessage: "Year is required when month is specified",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // Build the match query
  const matchQuery = { user: user._id };

  // Add date filters if provided
  if (year) {
    const yearNum = parseInt(year);

    if (month) {
      const monthNum = parseInt(month);

      // Create date range for the specific month and year
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 1);

      matchQuery.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    } else {
      // Filter by year only
      const startDate = new Date(yearNum, 0, 1);
      const endDate = new Date(yearNum + 1, 0, 1);

      matchQuery.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }
  }

  console.log("Match query:", matchQuery);

  // Convert pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const total = await Order.countDocuments(matchQuery);

  // Get orders with pagination and populate bartender
  const orders = await Order.find(matchQuery)
    .populate("bartender", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  console.log(`Found ${orders.length} orders out of ${total} total`);

  return {
    orders,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    hasNextPage: pageNum * limitNum < total,
    hasPrevPage: pageNum > 1,
  };
});
