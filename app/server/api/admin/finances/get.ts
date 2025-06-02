import { Order } from "@/server/models/order";
import { Raise } from "@/server/models/raise";

export default defineEventHandler(async (event) => {
    const { month, year } = getQuery(event);

    const orders = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            }
        }
    ]);

    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: '$total' }
            }
        }
    ]);

    const raises = await Raise.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            }
        }
    ]);

    const totalRaised = await Raise.aggregate([
        {
            $group: {
                _id: null,
                totalRaised: { $sum: '$amount' }
            }
        }
    ]);

    // Get daily sales for the current month with adjusted dates for purchases before 8:00 AM
    const salesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(year, month - 1, 1, 0, 0, 0),
                    $lt: new Date(year, month, 1, 0, 0, 0)
                }
            }
        },
        {
            $addFields: {
                // Convert to local time and check if hour is before 8:00 AM
                localHour: { $hour: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
                localDate: {
                    $dateToString: { 
                        format: "%Y-%m-%d", 
                        date: "$createdAt",
                        timezone: "Europe/Amsterdam"
                    }
                },
                // Get the date parts for potential adjustment
                year: { $year: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
                month: { $month: { date: "$createdAt", timezone: "Europe/Amsterdam" } },
                day: { $dayOfMonth: { date: "$createdAt", timezone: "Europe/Amsterdam" } }
            }
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
                                        timezone: "Europe/Amsterdam"
                                    }
                                },
                                timezone: "Europe/Amsterdam"
                            }
                        },
                        else: "$localDate"
                    }
                }
            }
        },
        {
            $group: {
                _id: "$adjustedDate",
                total: { $sum: "$total" },
                date: { $first: "$adjustedDate" }
            }
        },
        { $sort: { date: 1 } },
        {
            $project: {
                _id: 0,
                date: 1,
                total: 1
            }
        }
    ]);

    // Create a map of date to total for easier lookup
    const salesMap = new Map(salesData.map(item => [item.date, item.total]));
    
    // Generate all days for the current month
    const daysInMonth = new Date(year, month, 0).getDate();
    const salesPerDay = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
        salesPerDay.push({
            date: dateStr,
            total: salesMap.get(dateStr) || 0
        });
    }

    return { 
        orders, 
        totalSales: totalSales[0]?.totalSales || 0, 
        raises, 
        totalRaised: totalRaised[0]?.totalRaised || 0,
        salesPerDay
    };
});