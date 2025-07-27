import { defineEventHandler, getQuery, createError } from "h3";
import { Purchase } from "~/server/models/purchase";
import { Types } from "mongoose";
import type { PipelineStage } from "mongoose";

interface PurchaseQuery {
  page?: string;
  limit?: string;
  searchUser?: string;
  searchProduct?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery<PurchaseQuery>(event);
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "5", 10);
    const skip = (page - 1) * limit;

    // Search and filter parameters
    const userId = query.searchUser;
    const productId = query.searchProduct;
    const dateFrom = query.dateFrom;
    const dateTo = query.dateTo;

    // Build the filter object with proper typing
    const filter: Record<string, any> = {};

    // Date range filter
    if (dateFrom || dateTo) {
      filter.dayOfOrder = {};
      if (dateFrom) {
        filter.dayOfOrder.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add 1 day to include the entire "to" date
        const toDate = new Date(dateTo);
        toDate.setDate(toDate.getDate() + 1);
        filter.dayOfOrder.$lt = toDate;
      }
    }

    // Add user and product ID filters
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }
    if (productId) {
      filter.productId = new Types.ObjectId(productId);
    }

    // Define pipeline stages with proper typing
    const pipeline: PipelineStage[] = [
      // Apply filters first for better performance
      { $match: filter },

      // Lookup user data
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user" } },

      // Lookup product data
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product" } },

      // Sort by day of order (newest first)
      { $sort: { dayOfOrder: -1 } },
    ];

    // Get total count with filters applied
    const countPipeline: PipelineStage[] = [
      ...pipeline,
      { $count: "total" } as PipelineStage.Count,
    ];

    const countResult = await Purchase.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Get paginated results
    const purchasesPipeline: PipelineStage[] = [
      ...pipeline,
      { $skip: skip } as PipelineStage.Skip,
      { $limit: limit },
      // Project the final structure
      {
        $project: {
          _id: 1,
          quantity: 1,
          price: 1,
          notes: 1,
          dayOfOrder: 1,
          productId: {
            id: "$product._id",
            name: "$product.name",
            price: "$product.price",
            packSize: "$product.packSize",
          },
          userId: {
            id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
          },
        },
      },
    ];

    const purchases = await Purchase.aggregate(purchasesPipeline);

    return {
      data: purchases,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        searchUser: userId,
        searchProduct: productId,
        dateFrom,
        dateTo,
      },
    };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch purchases",
    });
  }
});
