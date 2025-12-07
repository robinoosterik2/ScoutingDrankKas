import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

type SessionUser = {
  id?: string;
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body?.productId || !body?.quantity || body.price === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Missing required fields: productId, quantity, and price are required",
      });
    }

    const productId = String(body.productId);
    const quantity = Number(body.quantity);
    const price = Number(body.price);
    const packSize = body.packSize !== undefined ? Number(body.packSize) : null;
    const packQuantity =
      body.packQuantity !== undefined ? Number(body.packQuantity) : null;
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;
    const dayOfOrder = body.dayOfOrder ? new Date(body.dayOfOrder) : new Date();

    if (Number.isNaN(quantity) || Number.isNaN(price)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Invalid numeric values supplied for productId, quantity, or price",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }

    const session = await getUserSession(event);
    const sessionUser = session?.user as SessionUser | undefined;
    const executorValue = sessionUser?.id;
    const parsedExecutorId =
      executorValue !== undefined && executorValue !== null
        ? String(executorValue)
        : null;
    const executorId = parsedExecutorId;

    const [purchase] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          productId,
          userId: executorId ?? undefined,
          quantity,
          price,
          packSize: packSize ?? undefined,
          packQuantity: packQuantity ?? undefined,
          notes: notes || undefined,
          dayOfOrder,
        },
        include: {
          product: true,
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
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          stock: { increment: quantity },
        },
      }),
    ]);

    await logAuditEvent({
      event,
      executorId: executorId ?? undefined,
      action: "purchase_created",
      category: "inventory",
      targetType: "Product",
      targetId: product.id,
      description: `Recorded purchase #${purchase.id} for product ${product.name} (${product.id}): +${quantity} units, total ${price} cents.`,
    });

    return { success: true, data: purchase };
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to create purchase",
      data: error.data,
    });
  }
});
