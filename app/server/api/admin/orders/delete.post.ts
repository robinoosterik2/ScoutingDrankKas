import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Order ID is required",
      });
    }

    // First, get the order to be deleted
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!order) {
      throw createError({ statusCode: 404, statusMessage: "Order not found" });
    }

    // Refund user's balance
    const user = await prisma.user.findUnique({ where: { id: order.userId } });
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }

    // Add the order total back to user's balance
    await prisma.user.update({
      where: { id: user.id },
      data: { balance: { increment: order.total } },
    });

    // Revert product metrics for each product in the order
    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (product) {
        const recent = product.recentOrders
          ? JSON.parse(product.recentOrders)
          : [];
        // Can't reliably match exact historical entry; just keep within 30 days
        const thirty = new Date();
        thirty.setDate(thirty.getDate() - 30);
        const pruned = recent.filter((o: any) => new Date(o.date) >= thirty);
        const popularity =
          pruned.reduce((s: number, o: any) => s + (o.quantity || 0), 0) * 0.7 +
          Math.max(0, product.totalQuantitySold - item.count) * 0.3;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            totalOrders: { decrement: 1 },
            totalQuantitySold: { decrement: item.count },
            stock: { increment: item.count },
            recentOrders: JSON.stringify(pruned),
            popularityScore: popularity,
          },
        });
      }
    }

    // Delete the order
    await prisma.order.delete({ where: { id: Number(id) } });

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      statusMessage: errorMessage,
    });
  }
});
