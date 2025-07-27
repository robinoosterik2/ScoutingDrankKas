import { Order } from "@/server/models/order";
import { Raise } from "@/server/models/raise";
import { Purchase } from "@/server/models/purchase";
import { getDateRangeFromQuery } from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const { startDate, endDate } = getDateRangeFromQuery(event);

    // Run all aggregations in parallel
    const [totalSales, totalRaised, totalPurchases, totalOrders] =
      await Promise.all([
        // Get total sales
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
        ]),

        // Get total raised
        Raise.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]),

        // Get total purchases
        Purchase.aggregate([
          {
            $match: {
              dayOfOrder: { $gte: startDate, $lt: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$price" },
            },
          },
        ]),

        // Get total order count (separate from sales as we need the full count)
        Order.countDocuments({
          createdAt: { $gte: startDate, $lt: endDate },
        }),
      ]);

    const salesTotal = totalSales[0]?.total || 0;
    const raisesTotal = totalRaised[0]?.total || 0;
    const purchasesTotal = totalPurchases[0]?.total || 0;
    const ordersCount = totalOrders;

    return {
      totalRevenue: salesTotal,
      totalOrders: ordersCount,
      totalRaised: raisesTotal,
      totalPurchases: purchasesTotal,
      netRevenue: salesTotal - purchasesTotal,
      averageOrderValue: ordersCount > 0 ? salesTotal / ordersCount : 0,
    };
  } catch (error) {
    console.error("Error in finances summary endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch finance summary",
    });
  }
});
