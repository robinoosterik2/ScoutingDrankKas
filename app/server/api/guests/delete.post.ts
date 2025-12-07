import { defineEventHandler, readBody, createError } from "h3";
import { prisma } from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const body = await readBody(event);
  const { guestId } = body;

  if (!guestId) {
    throw createError({ statusCode: 400, message: "Missing guest ID" });
  }

  // Look up the guest in the User table
  const guest = await prisma.user.findUnique({
    where: { id: String(guestId) },
    include: {
      // For orders, we look at where they are the GUEST
      guestOrders: { select: { id: true } },
    },
  });

  if (!guest) {
    throw createError({ statusCode: 404, message: "Guest not found" });
  }

  if (!guest.isGuest) {
    throw createError({ statusCode: 400, message: "User is not a guest" });
  }

  // Check permissions: Host or Admin
  // Requester (from session)
  const requesterId = String(session.user.id);

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

  if (guest.guestOrders.length > 0) {
    // Soft delete if orders exist (to preserve history)
    await prisma.user.update({
      where: { id: guest.id },
      data: { active: false },
    });
    return { message: "Guest deactivated" };
  } else {
    // Hard delete if no history
    await prisma.user.delete({
      where: { id: guest.id },
    });
    return { message: "Guest deleted" };
  }
});
