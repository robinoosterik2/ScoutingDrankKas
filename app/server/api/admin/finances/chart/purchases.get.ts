import { getDateRangeFromQuery, fillMissingDataPoints } from "~/server/utils/dateFilters";

export default defineEventHandler(async (event) => {
  try {
    const range = getDateRangeFromQuery(event);
    const { startDate, endDate, isMonthlyView } = range;

    // Get purchases data using the dayOfOrder field
    const purchasesData: any[] = []; // Purchases not modeled

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
