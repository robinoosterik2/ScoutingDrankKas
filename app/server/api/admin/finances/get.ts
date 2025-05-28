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

    const totalRaised = raises.reduce((total, raise) => total + raise.amount, 0);
    const totalSold = orders.reduce((total, order) => total + order.total, 0);
    return { orders, totalSales, raises, totalRaised, totalSold };
});