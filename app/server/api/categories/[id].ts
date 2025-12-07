import { defineEventHandler } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};

  if (!id) {
    throw new Error("Category ID is required");
  }

  const category = await prisma.category.findUnique({
    where: { id: String(id) },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
});
