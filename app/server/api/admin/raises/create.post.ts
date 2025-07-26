import { Raise } from "@/server/models/raise";
import User from "@/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const session = await getUserSession(event);
    const admin_id = session.user;

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
      });
    }

    const amount = body.amount;

    // Find user to raise
    const user = await User.findById(userId);
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

    const raise = new Raise({
      user: userId,
      amount: amount,
      raiser: admin_id,
      paymentMethod: paymentMethod,
    });
    await raise.save();

    // Update user balance
    const updatedUser = await user.raise(amount);

    return { newBalance: updatedUser.balance };
  } catch (error) {
    console.error("Operation error:", error);

    // Re-throw createError instances
    if (error instanceof Error) {
      return createError({
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
