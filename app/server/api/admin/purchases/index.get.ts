import { defineEventHandler, getQuery, createError } from "h3";
import { Purchase } from "~/server/models/purchase";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 5;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Purchase.countDocuments();

    // Get paginated purchases with populated data
    const purchases = await Purchase.find()
      .sort({ purchaseDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate("productId", "name price packSize")
      .populate("userId", "firstName lastName");

    return {
      data: purchases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch purchases",
    });
  }
});
