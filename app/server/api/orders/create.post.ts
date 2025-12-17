import { defineEventHandler, createError, readBody } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // Get the user session
    const session = await getUserSession(event);
    const bartenderUser = session?.user as { id?: string } | undefined;
    const bartenderId = bartenderUser?.id;
    if (!bartenderId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Bartender user not found",
      });
    }

    const userIdNum = body.userId ? String(body.userId) : null;
    const guestIdNum = body.guestId ? String(body.guestId) : null;

    let targetUser = null;
    let targetGuest = null;
    let payerUser = null;

    if (guestIdNum) {
      targetGuest = await prisma.user.findUnique({
        where: { id: guestIdNum },
        include: { host: true },
      });
      if (!targetGuest || !targetGuest.isGuest) {
        throw createError({
          statusCode: 400,
          statusMessage: "Guest not found",
        });
      }
      if (!targetGuest.host) {
        throw createError({
          statusCode: 400,
          statusMessage: "Guest does not have a linked host",
        });
      }
      payerUser = targetGuest.host;
    } else if (userIdNum) {
      targetUser = await prisma.user.findUnique({ where: { id: userIdNum } });
      if (!targetUser) {
        throw createError({
          statusCode: 400,
          statusMessage: "User not found",
        });
      }
      payerUser = targetUser;
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "No user or guest specified",
      });
    }

    let totalInCents = 0;

    for (const item of body.products) {
      const productIdNum = String(item.productId);
      const productData = await prisma.product.findUnique({
        where: { id: productIdNum },
      });
      if (!productData) {
        throw createError({
          statusCode: 400,
          statusMessage: "Product not found",
        });
      }
      totalInCents += productData.price * item.count;
      // Update product metrics and stock
      const now = new Date();
      const recentArr = productData.recentOrders
        ? JSON.parse(productData.recentOrders)
        : [];
      recentArr.push({ date: now.toISOString(), quantity: item.count });
      const thirty = new Date();
      thirty.setDate(thirty.getDate() - 30);
      const pruned = recentArr.filter((o: any) => new Date(o.date) >= thirty);
      const recentQty = pruned.reduce(
        (s: number, o: any) => s + (o.quantity || 0),
        0
      );
      const popularity =
        recentQty * 0.7 + (productData.totalQuantitySold + item.count) * 0.3;
      await prisma.product.update({
        where: { id: productIdNum },
        data: {
          totalOrders: { increment: 1 },
          totalQuantitySold: { increment: item.count },
          stock: { decrement: item.count },
          recentOrders: JSON.stringify(pruned),
          popularityScore: popularity,
        },
      });
    }

    // 8 AM rule
    const now = new Date();
    const day = new Date(now);
    if (day.getHours() < 8) day.setDate(day.getDate() - 1);
    day.setHours(0, 0, 0, 0);

    // Update Payer Balance (Host or self)
    await prisma.user.update({
      where: { id: payerUser.id },
      data: { balance: { decrement: totalInCents } },
    });

    // If Guest, update guest balance (decrement since they are spending)
    // Assuming balance starts at 0 -> -total.
    if (targetGuest) {
      await prisma.user.update({
        where: { id: targetGuest.id },
        data: {
          balance: { decrement: totalInCents },
          totalOrders: { increment: 1 },
          popularityScore: { increment: 1 },
        },
      });
    } else {
      // If not guest, update payer's stats
      await prisma.user.update({
        where: { id: payerUser.id },
        data: {
          totalOrders: { increment: 1 },
          popularityScore: { increment: 1 },
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: payerUser.id,
        guestId: targetGuest ? targetGuest.id : null,
        bartenderId: String(bartenderId),
        total: totalInCents,
        dayOfOrder: day,
        items: {
          create: body.products.map((p: any) => ({
            productId: String(p.productId),
            count: p.count,
          })),
        },
      },
    });

    const targetName = targetGuest
      ? `${targetGuest.username} (Guest)`
      : payerUser.username;

    await logAuditEvent({
      event,
      action: "order_created",
      category: "order",
      targetType: "Order",
      targetId: order.id,
      description: `Order ${order.id} created for ${targetName} totaling ${totalInCents} cents.`,
    });
    return { message: "Order created successfully" };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while creating new order " + error.message,
    });
  }
});
