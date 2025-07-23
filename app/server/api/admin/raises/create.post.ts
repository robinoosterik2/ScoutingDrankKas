import { Raise } from "@/server/models/raise";
import User from "@/server/models/user";
import { euroToCents, centsToEuro } from "@/server/utils/moneyFormatter";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const session = await getUserSession(event);
    const admin_id = session.user;

    if (!admin_id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

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

    const amount = euroToCents(body.amount);

    // Find user (no session needed)
    const user = await User.findById(userId);
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    // Create and save raise record
    const raise = new Raise({
      user: userId,
      amount: amount,
      raiser: admin_id,
    });
    await raise.save();

    // Update user balance
    const updatedUser = await user.raise(amount);

    return { newBalance: centsToEuro(updatedUser.balance) };
  } catch (error) {
    console.error("Operation error:", error);

    // Re-throw createError instances
    if (error?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
