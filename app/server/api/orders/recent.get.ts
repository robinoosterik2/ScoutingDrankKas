import { defineEventHandler, getQuery, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userId = query.userId as string | undefined;
    const guestId = query.guestId as string | undefined;

    const where: any = {};
    if (guestId) {
      where.guestId = String(guestId);
    } else if (userId) {
      where.userId = String(userId);
      // Optional: if we want to include orders where this user was a guest?
      // For now, if userId is passed, we assume we want orders 'paid by' this user (as host/user).
      // But usually 'recent orders' on dashboard means filters by the 'Active User' context.
      // If we selected a guest, we pass guestId.
    }

    const recentOrders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
        guest: {
          select: { id: true, firstName: true, lastName: true, username: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });

    // Map to legacy shape expected by UI
    const mapped = recentOrders.map((o) => {
      const displayUser = o.guest || o.user;
      return {
        id: o.id,
        user: {
          id: displayUser.id,
          firstName: displayUser.firstName,
          lastName: displayUser.lastName,
          username: displayUser.username,
          isGuest: !!o.guestId,
        },
        products: o.items.map((it) => ({
          productId: {
            id: it.product.id,
            name: it.product.name,
            price: it.product.price,
          },
          count: it.count,
        })),
        createdAt: o.createdAt,
        total: o.total,
      };
    });

    return { orders: mapped };
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch recent orders",
    });
  }
});
