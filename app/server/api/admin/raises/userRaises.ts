import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const recentRaises = await prisma.raise.findMany({
      where: { userId: Number(body.userId) },
      orderBy: { createdAt: 'desc' },
      take: body.limit || 5,
      include: { raiser: { select: { id: true, firstName: true, lastName: true } } },
    });
    return recentRaises.map(r => ({ ...r, user: r.userId, raiser: r.raiser }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching Raises",
    });
  }
});
