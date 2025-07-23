import { defineEventHandler, getQuery } from "h3";
import User from "@/server/models/user";
import { centsToEuro } from "@/server/utils/moneyFormatter";

export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  const user = await User.findById(userId).select("balance");

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return {
    balance: centsToEuro(user.balance),
  };
});
