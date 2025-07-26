import { Order } from "@/server/models/order";
import { Raise } from "@/server/models/raise";
import { Purchase } from "@/server/models/purchase";

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

  const orders = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "affectedUser",
      },
    },
    {
      $unwind: "$affectedUser",
    },
    {
      $lookup: {
        from: "users",
        localField: "bartender",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

  const totalSales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$total" },
      },
    },
  ]);

  const totalRaised = await Raise.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRaised: { $sum: "$amount" },
      },
    },
  ]);

  // Get total purchases
  const totalPurchases = await Purchase.aggregate([
    {
      $match: {
        purchaseDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalPurchases: { $sum: "$price" },
      },
    },
  ]);

  const raises = await Raise.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "affectedUser",
      },
    },
    {
      $unwind: "$affectedUser",
    },
    {
      $lookup: {
        from: "users",
        localField: "raiser",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  // Get daily sales for the current month with adjusted dates for purchases before 8:00 AM
  const salesDataStartDate = month
    ? new Date(filterYear, parseInt(month as string) - 1, 1, 0, 0, 0)
    : new Date(filterYear, 0, 1, 0, 0, 0);
  const salesDataEndDate = month
    ? new Date(filterYear, parseInt(month as string), 1, 0, 0, 0)
    : new Date(filterYear + 1, 0, 1, 0, 0, 0);

  // Get purchases data for the chart
  const purchasesData = await Purchase.aggregate([
    {
      $match: {
        purchaseDate: {
          $gte: salesDataStartDate,
          $lt: salesDataEndDate,
        },
      },
    },
    {
      $addFields: {
        // Convert to local time and adjust date if needed
        localDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$purchaseDate",
            timezone: "Europe/Amsterdam",
          },
        },
        // Calculate total amount for each purchase
        totalAmount: { $sum: "$price" },
      },
    },
    {
      $group: {
        _id: "$localDate",
        total: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        total: 1,
        label: "Purchases",
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);

  // Get sales data with date adjustments
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: salesDataStartDate,
          $lt: salesDataEndDate,
        },
      },
    },
    {
      $addFields: {
        // Convert to local time and check if hour is before 8:00 AM
        localHour: {
          $hour: { date: "$createdAt", timezone: "Europe/Amsterdam" },
        },
        localDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Europe/Amsterdam",
          },
        },
        // Get the date parts for potential adjustment
        year: { $year: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
        month: { $month: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
        day: {
          $dayOfMonth: { date: "$createdAt", timezone: "Europe/Amsterdam" },
        },
      },
    },
    {
      $addFields: {
        // Adjust date if before 8:00 AM
        adjustedDate: {
          $cond: {
            if: { $lt: ["$localHour", 8] }, // Before 8:00 AM
            then: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: {
                  $dateFromParts: {
                    year: "$year",
                    month: "$month",
                    day: "$day",
                    timezone: "Europe/Amsterdam",
                  },
                },
                timezone: "Europe/Amsterdam",
              },
            },
            else: "$localDate",
          },
        },
      },
    },
    {
      $group: {
        _id: "$adjustedDate",
        total: { $sum: "$total" },
        date: { $first: "$adjustedDate" },
      },
    },
    { $sort: { date: 1 } },
    {
      $project: {
        _id: 0,
        date: 1,
        total: 1,
      },
    },
  ]);

  // Get raises data with similar date adjustments
  const raisesData = await Raise.aggregate([
    {
      $match: {
        createdAt: {
          $gte: salesDataStartDate,
          $lt: salesDataEndDate,
        },
      },
    },
    {
      $addFields: {
        // Convert to local time and check if hour is before 8:00 AM
        localHour: {
          $hour: { date: "$createdAt", timezone: "Europe/Amsterdam" },
        },
        localDate: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Europe/Amsterdam",
          },
        },
        // Get the date parts for potential adjustment
        year: { $year: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
        month: { $month: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
        day: {
          $dayOfMonth: { date: "$createdAt", timezone: "Europe/Amsterdam" },
        },
      },
    },
    {
      $addFields: {
        // Adjust date if before 8:00 AM
        adjustedDate: {
          $cond: {
            if: { $lt: ["$localHour", 8] }, // Before 8:00 AM
            then: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: {
                  $dateFromParts: {
                    year: "$year",
                    month: "$month",
                    day: "$day",
                    timezone: "Europe/Amsterdam",
                  },
                },
                timezone: "Europe/Amsterdam",
              },
            },
            else: "$localDate",
          },
        },
      },
    },
    {
      $group: {
        _id: "$adjustedDate",
        total: { $sum: "$amount" },
        date: { $first: "$adjustedDate" },
      },
    },
    { $sort: { date: 1 } },
    {
      $project: {
        _id: 0,
        date: 1,
        total: 1,
      },
    },
  ]);

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
