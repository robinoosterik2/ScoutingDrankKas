import { defineEventHandler, getQuery, createError } from "h3";
import prisma from "~/server/utils/prisma";

interface PurchaseQuery {
  page?: string;
  limit?: string;
  searchUser?: string;
  searchProduct?: string;
  dateFrom?: string;
  dateTo?: string;
}

const parseOptionalNumber = (value?: string | null) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
};

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery<PurchaseQuery>(event);
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const searchUserId = parseOptionalNumber(query.searchUser);
    const searchProductId = parseOptionalNumber(query.searchProduct);

    const where: any = {};

    if (searchUserId !== null) {
      where.userId = searchUserId;
    }
    if (searchProductId !== null) {
      where.productId = searchProductId;
    }
    if (query.dateFrom || query.dateTo) {
      const dateFilter: any = {};
      if (query.dateFrom) {
        const from = new Date(query.dateFrom);
        from.setHours(0, 0, 0, 0);
        dateFilter.gte = from;
      }
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        dateFilter.lte = to;
      }
      where.dayOfOrder = dateFilter;
    }

    const [total, purchases] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              packSize: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { dayOfOrder: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const data = purchases.map((purchase) => ({
      id: purchase.id,
      productId: purchase.productId,
      product: purchase.product,
      userId: purchase.userId,
      user: purchase.user,
      quantity: purchase.quantity,
      price: purchase.price,
      packSize: purchase.packSize,
      packQuantity: purchase.packQuantity,
      notes: purchase.notes,
      dayOfOrder: purchase.dayOfOrder.toISOString(),
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt.toISOString(),
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch purchases",
    });
  }
});
