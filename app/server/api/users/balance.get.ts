import { defineEventHandler, getQuery } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { userId } = getQuery(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) }, select: { balance: true } });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  return {
    balance: user.balance,
  };
});
