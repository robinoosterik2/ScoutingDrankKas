import { Purchase } from "@/server/models/purchase";
import { getDateRangeFromQuery, fillMissingDataPoints } from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    // Get purchases data using the dayOfOrder field
    const purchasesData = await Purchase.aggregate([
      {
        $match: {
          dayOfOrder: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$dayOfOrder",
            },
          },
          total: { $sum: "$price" },
          date: { $first: "$dayOfOrder" },
        },
      },
      { 
        $sort: { date: 1 } 
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          total: 1,
        },
      },
    ]);

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
