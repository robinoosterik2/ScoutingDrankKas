import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { popularityScore: "desc" },
      include: { categories: { include: { category: true } } },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      ageRestriction: p.ageRestriction,
      imageUrl: p.imageUrl,
      totalOrders: p.totalOrders,
      totalQuantitySold: p.totalQuantitySold,
      popularityScore: p.popularityScore,
      categories: p.categories.map((pc) => String(pc.categoryId)),
    }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching custom roles",
    });
  }
});
