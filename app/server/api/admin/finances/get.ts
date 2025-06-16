import { Order } from "@/server/models/order";
import { Raise } from "@/server/models/raise";

export default defineEventHandler(async (event) => {
    const { month, year } = getQuery(event);
    
    // Set default values if not provided
    const currentDate = new Date();
    const filterYear = year ? parseInt(year as string) : currentDate.getFullYear();
    
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
                    $lt: endDate
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'affectedUser'
            }
        },
        {
            $unwind: '$affectedUser'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'bartender',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        }
    ]);

    const totalSales = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
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
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'affectedUser'
            }
        },
        {
            $unwind: '$affectedUser'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'raiser',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    const totalRaised = await Raise.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRaised: { $sum: '$amount' }
            }
        }
    ]);

    // Get daily sales for the current month with adjusted dates for purchases before 8:00 AM
    const salesDataStartDate = month 
        ? new Date(filterYear, parseInt(month as string) - 1, 1, 0, 0, 0)
        : new Date(filterYear, 0, 1, 0, 0, 0);
    const salesDataEndDate = month 
        ? new Date(filterYear, parseInt(month as string), 1, 0, 0, 0)
        : new Date(filterYear + 1, 0, 1, 0, 0, 0);

    const salesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: salesDataStartDate,
                    $lt: salesDataEndDate
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
    
    // Generate all days for the selected period
    const salesPerDay = [];
    
    if (month) {
        // Monthly view - show all days of the month
        const daysInMonth = new Date(filterYear, parseInt(month as string), 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = new Date(filterYear, parseInt(month as string) - 1, day).toISOString().split('T')[0];
            salesPerDay.push({
                date: dateStr,
                total: salesMap.get(dateStr) || 0
            });
        }
    } else {
        // Yearly view - show monthly totals
        for (let m = 0; m < 12; m++) {
            const monthDate = new Date(filterYear, m, 1);
            const monthKey = monthDate.toISOString().slice(0, 7); // YYYY-MM format
            
            // Calculate total for the month by summing all days in that month
            let monthTotal = 0;
            salesMap.forEach((value, key) => {
                if (key.startsWith(monthKey)) {
                    monthTotal += value;
                }
            });
            
            salesPerDay.push({
                date: monthDate.toISOString().split('T')[0],
                total: monthTotal
            });
        }
    }
    return { 
        orders, 
        totalSales: totalSales[0]?.totalSales || 0, 
        raises, 
        totalRaised: totalRaised[0]?.totalRaised || 0,
        salesPerDay
    };
});