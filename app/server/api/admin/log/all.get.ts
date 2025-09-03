import prisma from "~/server/utils/prisma";
import { defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' },
      include: { executor: { select: { id: true, username: true } } },
      take: 200,
    });
    return logs.map(l => ({
      id: l.id,
      _id: String(l.id),
      executor: l.executor,
      action: l.action,
      description: l.description,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    }));
  } catch (error) {
    event.res.statusCode = 500;
    return { error: "Failed to fetch logs: " + error };
  }
});
