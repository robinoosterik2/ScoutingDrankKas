import { defineEventHandler, getQuery } from 'h3';
import { Order } from '@/server/models/order';
import { User } from '@/server/models/user';

export default defineEventHandler(async (event) => {
  const { userId, month, year } = getQuery(event);
  console.log("3 userId, month, year", userId, month, year);

  if (!userId || !month || !year) {
    throw createError({ statusCode: 400, statusMessage: 'User ID, month, and year are required' });
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  const orders = await Order.find({
    user: userId,
    createdAt: {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1)
    }
  });
  console.log(orders);
  return orders;
});