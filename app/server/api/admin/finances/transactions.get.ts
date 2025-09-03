import prisma from "~/server/utils/prisma";
import { getDateRangeFromQuery } from '~/server/utils/dateFilters';

interface UserInfo {
  firstName?: string;
  lastName?: string;
}

// Transaction product type
interface TransactionProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

// Define the Transaction type as a union of specific transaction types
type Transaction =
  | {
      _id: string;
      type: 'order';
      displayAmount: number;
      user: UserInfo;
      bartender?: UserInfo;
      products: Array<{
        _id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
      paymentMethod: string;
      createdAt: Date;
      updatedAt: Date;
    }
  | {
      _id: string;
      type: 'raise';
      displayAmount: number;
      user: UserInfo;
      raiser?: UserInfo;
      paymentMethod: string;
      createdAt: Date;
      updatedAt: Date;
    }
  | {
      _id: string;
      type: 'purchase';
      displayAmount: number;
      user: UserInfo;
      product: {
        _id: string;
        name: string;
        price: number;
        quantity: number;
      };
      quantity: number;
      price: number;
      notes?: string;
      packSize?: number;
      packQuantity?: number;
      dayOfOrder: Date;
      createdAt: Date;
      updatedAt: Date;
    };

export default defineEventHandler(async (event) => {
  try {
    const { startDate, endDate } = getDateRangeFromQuery(event);
    const { page = "1", limit = "10" } = getQuery(event);

    // Parse pagination parameters with defaults
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    // Remove unused queryOptions since we're using MongoDB's native methods

    // Get all orders, raises, and purchases in parallel with proper population and pagination
    const [orders, totalOrders, raises, totalRaises] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { user: true, bartender: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.raise.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { user: true, raiser: true },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.raise.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
    ]);
    const purchases: any[] = [];
    const totalPurchases = 0;

    // Calculate total items across all transaction types
    const totalItems = Number(totalOrders || 0) + Number(totalRaises || 0) + Number(totalPurchases || 0);

    // Transform orders to transactions
    const orderTransactions = (orders || []).map((order: any): Transaction => {
      const userInfo = {
        firstName: order.user?.firstName,
        lastName: order.user?.lastName
      };
      const bartenderInfo = order.bartender ? {
        firstName: order.bartender.firstName,
        lastName: order.bartender.lastName
      } : undefined;

      return {
        _id: String(order.id),
        type: 'order',
        displayAmount: order.total,
        user: userInfo,
        bartender: bartenderInfo,
        products: (order.items || []).map((p: any) => ({
          _id: String(p.product?.id || ''),
          name: p.product?.name || 'Unknown Product',
          price: p.product?.price || 0,
          quantity: p.count || 0
        })),
        paymentMethod: 'unknown',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });

    // Transform raises to transactions
    const raiseTransactions = (raises || []).map((raise: any): Transaction => ({
      _id: String(raise.id),
      type: 'raise',
      displayAmount: raise.amount,
      user: {
        firstName: raise.user?.firstName,
        lastName: raise.user?.lastName
      },
      raiser: raise.raiser ? {
        firstName: raise.raiser.firstName,
        lastName: raise.raiser.lastName
      } : undefined,
      paymentMethod: raise.paymentMethod,
      createdAt: raise.createdAt,
      updatedAt: raise.updatedAt
    }));

    // Transform purchases to transactions
    const purchaseTransactions = (purchases || []).map((purchase: any): Transaction => ({
      _id: purchase._id.toString(),
      type: 'purchase',
      displayAmount: purchase.price * purchase.quantity,
      user: {
        firstName: purchase.userId?.firstName,
        lastName: purchase.userId?.lastName
      },
      product: {
        _id: purchase.productId._id.toString(),
        name: purchase.productId.name,
        price: purchase.productId.price,
        quantity: purchase.quantity
      },
      quantity: purchase.quantity,
      price: purchase.price,
      notes: purchase.notes,
      packSize: purchase.packSize,
      packQuantity: purchase.packQuantity,
      dayOfOrder: purchase.dayOfOrder,
      createdAt: purchase.dayOfOrder, // Using dayOfOrder as created at
      updatedAt: purchase.updatedAt
    }));

    // Combine and sort all transactions by date (newest first)
    const allTransactions = [
      ...orderTransactions,
      ...raiseTransactions,
      ...purchaseTransactions
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTransactions = allTransactions.slice(startIndex, startIndex + limitNum);

    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));
    
    // Use the paginated transactions in the response
    const responseData = paginatedTransactions;

    return {
      data: responseData,
      pagination: {
        total: totalItems,
        totalPages,
        currentPage: pageNum,
        perPage: limitNum
      }
    };
  } catch (error) {
    console.error("Error in transactions endpoint:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch transactions",
    });
  }
});
