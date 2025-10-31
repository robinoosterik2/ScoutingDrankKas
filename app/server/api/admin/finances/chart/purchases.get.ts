import { getDateRangeFromQuery, fillMissingDataPoints } from "~/server/utils/dateFilters";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    const purchases = await prisma.purchase.findMany({
      where: {
        dayOfOrder: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        dayOfOrder: true,
        price: true,
      },
    });

    const purchasesMap = new Map<string, number>();
    for (const purchase of purchases) {
      const date = purchase.dayOfOrder;
      const key = range.isMonthlyView
        ? date.toISOString().split("T")[0]
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
      purchasesMap.set(key, (purchasesMap.get(key) || 0) + purchase.price);
    }

    const purchasesData = Array.from(purchasesMap.entries()).map(
      ([date, total]) => ({
        date,
        total,
      })
    );

    // Ensure we have data points for all days/months in the range
    const filledData = fillMissingDataPoints(purchasesData, range);

    return {
      data: filledData,
      isMonthlyView,
      year: range.year,
      month: range.month,
    };
  } catch (error) {
    console.error('Error in purchases chart endpoint:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch purchases chart data',
    });
  }
});
