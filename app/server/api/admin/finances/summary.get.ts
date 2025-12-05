import { prisma } from "~/server/utils/prisma";
import { getDateRangeFromQuery } from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const { startDate, endDate } = getDateRangeFromQuery(event);

    // Run all aggregations in parallel
    const [salesAgg, raisesAgg, ordersCount, purchasesAgg] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.raise.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.purchase.aggregate({
        _sum: { price: true },
        where: { dayOfOrder: { gte: startDate, lt: endDate } },
      }),
    ]);

    const salesTotal = salesAgg._sum.total || 0;
    const raisesTotal = raisesAgg._sum.amount || 0;
    const purchasesTotal = purchasesAgg._sum.price || 0;

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
