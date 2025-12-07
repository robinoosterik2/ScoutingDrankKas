import { defineEventHandler, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Fetch guests from User table
  const guests = await prisma.user.findMany({
    where: {
      hostId: String(session.user.id),
      isGuest: true,
      active: true,
    },
    orderBy: { username: "asc" },
  });

  console.log(guests);

  return guests;
});
