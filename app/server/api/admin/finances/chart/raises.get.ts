import { prisma } from "~/server/utils/prisma";
import {
  getDateRangeFromQuery,
  fillMissingDataPoints,
} from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    // Get raises data using the dayOfOrder field
    const grouped = await prisma.raise.findMany({
      where: { dayOfOrder: { gte: startDate, lt: endDate } },
      orderBy: { dayOfOrder: "asc" },
      select: { dayOfOrder: true, amount: true },
    });
    const map = new Map<string, number>();
    for (const r of grouped) {
      const key = r.dayOfOrder.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + r.amount);
    }
    const raisesData = Array.from(map.entries()).map(([date, total]) => ({
      date,
      total,
    }));

    // Ensure we have data points for all days/months in the range
    const filledData = fillMissingDataPoints(raisesData, range);

    return {
      data: filledData,
      isMonthlyView,
      year: range.year,
      month: range.month,
    };
  } catch (error) {
    console.error("Error in raises chart endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch raises chart data",
    });
  }
});
