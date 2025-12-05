import type { H3Event } from "h3";
import { prisma } from "~/server/utils/prisma";

type SessionUser = {
  id?: number | string;
  _id?: string;
};

interface LogParams {
  event?: H3Event;
  executorId?: number | null;
  action: string;
  category: string;
  targetType: string;
  targetId?: number | null;
  description: string;
  level?: string;
}

/**
 * Write an audit log entry while failing gracefully if anything goes wrong.
 * Resolves the executor from the current session when not provided explicitly.
 */
export async function logAuditEvent({
  event,
  executorId,
  action,
  category,
  targetType,
  targetId,
  description,
  level = "info",
}: LogParams) {
  try {
    let resolvedExecutorId = executorId ?? null;

    if (!resolvedExecutorId && event) {
      try {
        const session = await getUserSession(event);
        const sessionUser = session?.user as SessionUser | undefined;
        const sessionId = sessionUser?.id ?? sessionUser?._id;
        if (sessionId !== undefined && sessionId !== null) {
          const numericId = Number(sessionId);
          if (!Number.isNaN(numericId)) {
            resolvedExecutorId = numericId;
          }
        }
      } catch (sessionError) {
        console.warn(
          "logAuditEvent: Unable to resolve session user",
          sessionError
        );
      }
    }

    await prisma.log.create({
      data: {
        executorId: resolvedExecutorId ?? undefined,
        action,
        level,
        category,
        targetType,
        targetId: targetId ?? undefined,
        description,
      },
    });
  } catch (error) {
    console.error("logAuditEvent: Failed to create log entry", error);
  }
}
