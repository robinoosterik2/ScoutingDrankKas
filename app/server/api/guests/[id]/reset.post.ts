import { defineEventHandler, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const user = session?.user as { id: string } | undefined;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const id = event.context.params?.id;
  if (!id) {
    throw createError({ statusCode: 400, message: "Missing guest ID" });
  }

  const guest = await prisma.user.findUnique({
    where: { id: String(id) },
  });

  if (!guest) {
    throw createError({ statusCode: 404, message: "Guest not found" });
  }

  if (!guest.isGuest) {
    throw createError({ statusCode: 400, message: "User is not a guest" });
  }

  // Permission check
  const requesterId = String(user.id);
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    include: { role: true },
  });

  const isAdmin = requester?.role?.roleName?.toLowerCase() === "admin";
  const isHost = guest.hostId === requesterId;

  if (!isHost && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: "Forbidden: You are not the host of this guest",
    });
  }

  const updatedGuest = await prisma.user.update({
    where: { id: guest.id },
    data: {
      balance: 0,
      totalOrders: 0,
      popularityScore: 0,
    },
  });

  return updatedGuest;
});
