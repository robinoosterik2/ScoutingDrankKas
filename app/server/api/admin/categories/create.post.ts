import { prisma } from "~/server/utils/prisma";
import { logAuditEvent } from "~/server/utils/logger";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, ageRestriction } = body;
    const categoryExists = await prisma.category.findFirst({ where: { name } });
    if (categoryExists) {
      throw createError({
        statusCode: 400,
        statusMessage: "Category already exists",
      });
    }
    const created = await prisma.category.create({
      data: { name, ageRestriction },
    });
    await logAuditEvent({
      event,
      action: "category_created",
      category: "category",
      targetType: "Category",
      targetId: created.id,
      description: `Created category ${created.name} (${created.id}).`,
    });
    return created;
  } catch (error) {
    console.error("Failed to create category", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
