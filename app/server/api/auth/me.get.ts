import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const user = session?.user as { id: string } | undefined;

  if (!user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication required",
    });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      role: true,
      settings: true,
    },
  });

  if (!dbUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User not found",
    });
  }

  // Remove sensitive data
  const { password, ...safeUser } = dbUser;

  return safeUser;
});
