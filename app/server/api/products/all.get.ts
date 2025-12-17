import { defineEventHandler, getQuery, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const search = query.search ? String(query.search).trim() : null;
    const categoryId = query.category ? String(query.category) : null;
    const sortBy = query.sortBy ? String(query.sortBy) : "name";
    const sortDir = query.sortDir === "desc" ? "desc" : "asc";

    const where: any = { archived: false };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categories = { has: categoryId };
    }

    let orderBy: any = {};
    if (sortBy === "price") {
      orderBy = { price: sortDir };
    } else if (sortBy === "stock") {
      orderBy = { stock: sortDir };
    } else {
      orderBy = { name: sortDir };
    }

    // Check if pagination is requested
    const isPaginationRequested =
      query.page !== undefined || query.limit !== undefined;

    if (!isPaginationRequested) {
      const products = await prisma.product.findMany({
        where,
        include: {
          categories: true,
        },
        orderBy,
      });
      return products;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          categories: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching products",
    });
  }
});
