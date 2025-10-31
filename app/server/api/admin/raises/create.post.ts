import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const session = await getUserSession(event);
    const adminUser = session?.user as { id?: number | string; _id?: string } | undefined;
    const admin_id = Number(adminUser?.id ?? adminUser?._id);

    const userId = body.userId;

    // Input validation
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    if (!body.amount || body.amount <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Valid amount is required",
      });
    }

    if (userId === admin_id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot top up yourself for security reasons",
        data: { i18nKey: "raise.errors.selfTopUp" },
      });
    }

    const amount = body.amount;

    // Find user to raise
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Create and save raise record
    const paymentMethod = body.paymentMethod || "cash";

    // Input validation for payment method
    if (!["cash", "pin"].includes(paymentMethod)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid payment method. Must be 'cash' or 'pin'.",
      });
    }

    const created = await prisma.raise.create({ data: { userId: user.id, raiserId: admin_id, amount, paymentMethod, dayOfOrder: new Date() } });
    const updated = await prisma.user.update({ where: { id: user.id }, data: { balance: { increment: amount } } });
    return { newBalance: updated.balance };
  } catch (error) {
    console.error("Operation error:", error);

    // Let H3 errors bubble up so the frontend receives the original status/message
    if (error instanceof Error && "statusCode" in error) {
      throw error;
    }
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
