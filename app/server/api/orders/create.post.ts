import { defineEventHandler, createError, readBody } from "h3";
import prisma from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // Get the user session
    const session = await getUserSession(event);
    const bartenderUser = session?.user as { id?: number | string; _id?: string } | undefined;
    const bartenderId = bartenderUser?.id ?? bartenderUser?._id;
    if (!bartenderId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Bartender user not found",
      });
    }

    // Find the customer user
    const userIdNum = Number(body.userId);
    const user = await prisma.user.findUnique({ where: { id: userIdNum } });
    if (!user) {
      throw createError({ statusCode: 400, statusMessage: "User not found" });
    }

    // Use the bartender's user ID from the session
    body.bartenderId = session.user._id;

    let totalInCents = 0;

    for (const item of body.products) {
      const productIdNum = Number(item.productId);
      const productData = await prisma.product.findUnique({ where: { id: productIdNum } });
      if (!productData) {
        throw createError({
          statusCode: 400,
          statusMessage: "Product not found",
        });
      }
      totalInCents += productData.price * item.count;
      // Update product metrics and stock
      const now = new Date();
      const recentArr = productData.recentOrders ? JSON.parse(productData.recentOrders) : [];
      recentArr.push({ date: now.toISOString(), quantity: item.count });
      const thirty = new Date();
      thirty.setDate(thirty.getDate() - 30);
      const pruned = recentArr.filter((o: any) => new Date(o.date) >= thirty);
      const recentQty = pruned.reduce((s: number, o: any) => s + (o.quantity || 0), 0);
      const popularity = recentQty * 0.7 + (productData.totalQuantitySold + item.count) * 0.3;
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

    await prisma.user.update({ where: { id: user.id }, data: { balance: { decrement: totalInCents } } });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        bartenderId: Number(bartenderId),
        total: totalInCents,
        dayOfOrder: day,
        items: {
          create: body.products.map((p: any) => ({
            productId: Number(p.productId),
            count: p.count,
          })),
        },
      },
    });
    await logAuditEvent({
      event,
      action: "order_created",
      category: "order",
      targetType: "Order",
      targetId: order.id,
      description: `Order ${order.id} created for user ${user.username} (${user.id}) totaling ${totalInCents} cents.`,
    });
    return { message: "Order created successfully" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while creating new order " + error,
    });
  }
});
