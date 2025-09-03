import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const user = await getUserSession(event);

    const { name, ageRestriction } = body;
    const categoryExists = await prisma.category.findFirst({ where: { name } });
    if (categoryExists) {
      throw createError({
        statusCode: 400,
        statusMessage: "Category already exists",
      });
    }
    const created = await prisma.category.create({ data: { name, ageRestriction } });
    // Optionally log
    await prisma.log.create({
      data: {
        executorId: Number(user.user?.id ?? user.user?._id) || undefined,
        action: 'category_created',
        level: 'info',
        category: 'category',
        targetType: 'Category',
        targetId: created.id,
        description: `User created a new category: ${created.name}`,
      },
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
