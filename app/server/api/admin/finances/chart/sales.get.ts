import { prisma } from "~/server/utils/prisma";
import {
  getDateRangeFromQuery,
  fillMissingDataPoints,
} from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    // Get sales data using the dayOfOrder field
    const grouped = await prisma.order.findMany({
      where: { dayOfOrder: { gte: startDate, lt: endDate } },
      orderBy: { dayOfOrder: "asc" },
      select: { dayOfOrder: true, total: true },
    });
    const map = new Map<string, number>();
    for (const o of grouped) {
      const key = o.dayOfOrder.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + o.total);
    }
    const salesData = Array.from(map.entries()).map(([date, total]) => ({
      date,
      total,
    }));

    // Ensure we have data points for all days/months in the range
    const filledData = fillMissingDataPoints(salesData, range);

    return {
      data: filledData,
      isMonthlyView,
      year: range.year,
      month: range.month,
    };
  } catch (error) {
    console.error("Error in sales chart endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch sales chart data",
    });
  }
});
