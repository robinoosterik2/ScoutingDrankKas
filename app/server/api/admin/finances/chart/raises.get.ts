import { Raise } from "@/server/models/raise";
import { getDateRangeFromQuery, fillMissingDataPoints } from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    // Get raises data using the dayOfOrder field
    const raisesData = await Raise.aggregate([
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
          total: { $sum: "$amount" },
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
    const filledData = fillMissingDataPoints(raisesData, range);

    return {
      data: filledData,
      isMonthlyView,
      year: range.year,
      month: range.month,
    };
  } catch (error) {
    console.error('Error in raises chart endpoint:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch raises chart data',
    });
  }
});
