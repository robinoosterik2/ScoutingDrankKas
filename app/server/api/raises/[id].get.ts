import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

interface RaiseDocument {
  id: any;
  user: any;
  raiser?: {
    id: any;
    firstName: string;
    lastName: string;
  } | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RaiseResponse {
  id: string;
  user: string;
  raiser: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default defineEventHandler(async (event) => {
  try {
    const userId = event.context.params?.id;
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }

    const [raises, total] = await Promise.all([
      prisma.raise.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          raiser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.raise.count({ where: { userId: String(userId) } }),
    ]);

    return {
      raises: raises.map((raise: any) => ({
        id: raise.id,
        user: raise.userId,
        raiser: raise.raiser
          ? {
              id: raise.raiser.id,
              firstName: raise.raiser.firstName,
              lastName: raise.raiser.lastName,
            }
          : null,
        amount: raise.amount,
        createdAt: raise.createdAt,
        updatedAt: raise.updatedAt,
      })),
      total,
    };
  } catch (error) {
    console.error("Error fetching user raises:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch user raises";
    const statusCode = (error as any)?.statusCode || 500;

    throw createError({
      statusCode: statusCode,
      statusMessage: errorMessage,
      data: {
        message: "Failed to fetch user raises",
      },
    });
  }
});
