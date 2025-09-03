import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { month, year } = getQuery(event);

  // Set default values if not provided
  const currentDate = new Date();
  const filterYear = year
    ? parseInt(year as string)
    : currentDate.getFullYear();

  // Create date range for filtering
  let startDate, endDate;

  if (month) {
    const filterMonth = parseInt(month as string);
    startDate = new Date(filterYear, filterMonth - 1, 1);
    endDate = new Date(filterYear, filterMonth, 1);
  } else {
    // If no month is selected, get the whole year
    startDate = new Date(filterYear, 0, 1);
    endDate = new Date(filterYear + 1, 0, 1);
  }

  const orders = await prisma.order.findMany({ where: { createdAt: { gte: startDate, lt: endDate } } });

  const totalSalesAgg = await prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: startDate, lt: endDate } } });

  const totalRaisedAgg = await prisma.raise.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startDate, lt: endDate } } });

  // Get total purchases
  const totalPurchases = 0;

  const raises = await prisma.raise.findMany({ where: { createdAt: { gte: startDate, lt: endDate } } });

  // Get daily sales for the current month with adjusted dates for purchases before 8:00 AM
  const salesDataStartDate = month
    ? new Date(filterYear, parseInt(month as string) - 1, 1, 0, 0, 0)
    : new Date(filterYear, 0, 1, 0, 0, 0);
  const salesDataEndDate = month
    ? new Date(filterYear, parseInt(month as string), 1, 0, 0, 0)
    : new Date(filterYear + 1, 0, 1, 0, 0, 0);

  // Purchases not modeled; empty array for chart
  const purchasesData: any[] = [];

  // Aggregate sales per day
  const salesRows = await prisma.order.findMany({ where: { createdAt: { gte: salesDataStartDate, lt: salesDataEndDate } }, select: { dayOfOrder: true, total: true } });
  const salesDataMap = new Map<string, number>();
  for (const r of salesRows) {
    const key = r.dayOfOrder.toISOString().slice(0,10);
    salesDataMap.set(key, (salesDataMap.get(key) || 0) + r.total);
  }
  const salesData = Array.from(salesDataMap.entries()).map(([date, total]) => ({ date, total }));

  // Aggregate raises per day
  const raisesRows = await prisma.raise.findMany({ where: { createdAt: { gte: salesDataStartDate, lt: salesDataEndDate } }, select: { dayOfOrder: true, amount: true } });
  const raisesDataMap = new Map<string, number>();
  for (const r of raisesRows) {
    const key = r.dayOfOrder.toISOString().slice(0,10);
    raisesDataMap.set(key, (raisesDataMap.get(key) || 0) + r.amount);
  }
  const raisesData = Array.from(raisesDataMap.entries()).map(([date, total]) => ({ date, total }));

  // Month names for labels
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  interface ChartDataPoint {
    date: string;
    total: number;
    label?: string;
  }

  // Create maps of date to total for easier lookup
  const salesMap = new Map(
    salesData.map((item: ChartDataPoint) => [item.date, item.total])
  );
  const raisesMap = new Map(
    raisesData.map((item: ChartDataPoint) => [item.date, item.total])
  );
  const purchasesMap = new Map(
    purchasesData.map((item: ChartDataPoint) => [item.date, item.total])
  );

  // Generate all days for the selected period
  const salesPerDay: ChartDataPoint[] = [];
  const raisesPerDay: ChartDataPoint[] = [];
  const purchasesPerDay: ChartDataPoint[] = [];

  // Get all unique dates from all datasets
  const allDates = [
    ...new Set([
      ...salesData.map((d) => d.date),
      ...raisesData.map((d) => d.date),
      ...purchasesData.map((d) => d.date),
    ]),
  ].sort();

  // Generate chart data points
  const chartData = allDates.map((date: string) => {
    const sales = salesMap.get(date) || 0;
    const raises = raisesMap.get(date) || 0;
    const purchases = purchasesMap.get(date) || 0;
    return {
      date,
      sales,
      raises,
      purchases,
      total: sales + raises - purchases, // Subtract purchases from total
    };
  });

  // Generate data for the selected period view
  const selectedMonth = month ? parseInt(month as string) : null;
  const selectedYear = filterYear;

  if (selectedMonth !== null) {
    // Monthly view - show all days of the month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dateStr = date.toISOString().split("T")[0];
      const monthDayStr = date.toISOString().slice(5, 10); // MM-DD format

      salesPerDay.push({
        date: dateStr,
        total: salesMap.get(dateStr) || 0,
        label: monthDayStr,
      });

      raisesPerDay.push({
        date: dateStr,
        total: raisesMap.get(dateStr) || 0,
        label: monthDayStr,
      });

      purchasesPerDay.push({
        date: dateStr,
        total: purchasesMap.get(dateStr) || 0,
        label: monthDayStr,
      });
    }
  } else {
    // Yearly view - show monthly totals
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(selectedYear, m, 1);
      const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM format

      // Calculate totals for the month by summing all days in that month
      let salesMonthTotal = 0;
      salesMap.forEach((value: number, key: string) => {
        if (key.startsWith(monthKey)) {
          salesMonthTotal += value;
        }
      });

      let raisesMonthTotal = 0;
      raisesMap.forEach((value: number, key: string) => {
        if (key.startsWith(monthKey)) {
          raisesMonthTotal += value;
        }
      });

      let purchasesMonthTotal = 0;
      purchasesMap.forEach((value: number, key: string) => {
        if (key.startsWith(monthKey)) {
          purchasesMonthTotal += value;
        }
      });

      salesPerDay.push({
        date: monthDate.toISOString().split("T")[0],
        total: salesMonthTotal,
        label: months[m],
      });

      raisesPerDay.push({
        date: monthDate.toISOString().split("T")[0],
        total: raisesMonthTotal,
        label: months[m],
      });

      purchasesPerDay.push({
        date: monthDate.toISOString().split("T")[0],
        total: purchasesMonthTotal,
        label: months[m],
      });
    }
  }

  console.log([...orders, ...raises]);

  // Prepare the response data
  const responseData = {
    summary: {
      totalRevenue: totalSales[0]?.totalSales || 0,
      totalOrders: orders.length,
      totalRaised: totalRaised[0]?.totalRaised || 0,
      totalPurchases: totalPurchases[0]?.totalPurchases || 0,
      netRevenue:
        (totalSales[0]?.totalSales || 0) +
        (totalRaised[0]?.totalRaised || 0) -
        (totalPurchases[0]?.totalPurchases || 0),
      averageOrderValue: orders.length
        ? totalSales[0]?.totalSales / orders.length
        : 0,
    },
    chartData: {
      labels: allDates,
      datasets: [
        {
          label: "Sales",
          data: chartData.map((d) => d.sales || 0),
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          tension: 0.4,
        },
        {
          label: "Raises",
          data: chartData.map((d) => d.raises || 0),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
        },
        {
          label: "Purchases",
          data: chartData.map((d) => d.purchases || 0),
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
      ],
    },
    transactions: [...orders, ...raises],
    salesPerDay: salesPerDay || [],
    raisesPerDay: raisesPerDay || [],
    purchasesPerDay: purchasesPerDay || [],
  };

  return responseData;
});
