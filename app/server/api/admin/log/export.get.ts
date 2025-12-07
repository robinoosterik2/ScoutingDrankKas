import { defineEventHandler, getQuery } from "h3";
import { prisma } from "~/server/utils/prisma";

type DateFilter = { gte?: Date; lte?: Date };

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const format = (query.format as string) || "csv";
    const users = query.users as string | string[];
    const actions = query.actions as string | string[];

    const createdAt: DateFilter = {};

    // Date range filter
    if (startDate || endDate) {
      // prepare the createdAt filter

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        parsedStartDate.setHours(0, 0, 0, 0);
        createdAt.gte = parsedStartDate;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999);
        createdAt.lte = parsedEndDate;
      }
    }

    // User filter
    const userIds = users ? (Array.isArray(users) ? users : [users]) : [];

    // Action filter
    const actionTypes = actions
      ? Array.isArray(actions)
        ? actions
        : [actions]
      : [];
    const logs = await prisma.log.findMany({
      where: {
        ...(startDate || endDate ? { createdAt } : {}),
        ...(userIds.length
          ? { executorId: { in: userIds.map((id: string) => id) } }
          : {}),
        ...(actionTypes.length
          ? { action: { in: actionTypes as string[] } }
          : {}),
      },
      include: { executor: true },
      orderBy: { createdAt: "desc" },
    });
    // Prepare response headers based on format
    if (format === "csv") {
      event.res.setHeader("Content-Type", "text/csv");
      event.res.setHeader(
        "Content-Disposition",
        "attachment; filename=logs_export.csv"
      );

      // Generate CSV content
      const csvHeader =
        "id,executor,action,objectType,objectId,description,createdAt\n";
      const csvRows = logs.map((log: any) => {
        const executor = log.executor ? log.executor.username : "Unknown";
        const description = log.description
          ? `"${log.description.replace(/"/g, '""')}"`
          : "";
        const createdAtStr = new Date(log.createdAt).toISOString();
        return `${log.id},${executor},${log.action},${log.targetType || ""},${
          log.targetId || ""
        },${description},${createdAtStr}`;
      });

      return csvHeader + csvRows.join("\n");
    } else {
      // JSON format
      event.res.setHeader("Content-Type", "application/json");
      event.res.setHeader(
        "Content-Disposition",
        "attachment; filename=logs_export.json"
      );

      // Map logs to a simpler structure
      const exportedLogs = logs.map((log: any) => ({
        id: log.id,
        executor: log.executor
          ? {
              id: log.executor.id,
              username: log.executor.username,
              email: log.executor.email,
            }
          : null,
        action: log.action,
        objectType: log.targetType,
        objectId: log.targetId,
        description: log.description,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      }));

      return JSON.stringify(exportedLogs, null, 2);
    }
  } catch (error) {
    console.error("Error exporting logs:", error);
    event.res.statusCode = 500;
    return { error: "Failed to export logs" };
  }
});
