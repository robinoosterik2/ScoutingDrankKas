import { defineEventHandler, getQuery } from "h3";
import Log from "@/server/models/log";
import mongoose from "mongoose";

interface LogQuery {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  executor?: {
    $in: mongoose.Types.ObjectId[];
  };
  action?: {
    $in: string[];
  };
}

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;
    const format = (query.format as string) || "csv";
    const users = query.users as string | string[];
    const actions = query.actions as string | string[];

    // Build MongoDB query
    const mongoQuery: LogQuery = {};

    // Date range filter
    if (startDate || endDate) {
      mongoQuery.createdAt = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        parsedStartDate.setHours(0, 0, 0, 0);
        mongoQuery.createdAt.$gte = parsedStartDate;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        parsedEndDate.setHours(23, 59, 59, 999);
        mongoQuery.createdAt.$lte = parsedEndDate;
      }
    }

    // User filter
    if (users) {
      const userIds = Array.isArray(users) ? users : [users];
      if (userIds.length > 0) {
        mongoQuery.executor = {
          $in: userIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
    }

    // Action filter
    if (actions) {
      const actionTypes = Array.isArray(actions) ? actions : [actions];
      if (actionTypes.length > 0) {
        mongoQuery.action = { $in: actionTypes };
      }
    }
    // Fetch logs with populated references
    const logs = await Log.find(mongoQuery)
      .populate("executor", "username email firstName lastName")
      .populate("objectId", "username name title")
      .sort({ createdAt: -1 });
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
      const csvRows = logs.map((log) => {
        const executor = log.executor ? log.executor.username : "Unknown";
        const description = log.description
          ? `"${log.description.replace(/"/g, '""')}"`
          : "";
        const createdAt = new Date(log.createdAt).toISOString();

        return `${log._id},${executor},${log.action},${log.objectType},${
          log.objectId?._id || log.objectId || ""
        },${description},${createdAt}`;
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
      const exportedLogs = logs.map((log) => ({
        id: log._id,
        executor: log.executor
          ? {
              id: log.executor._id,
              username: log.executor.username,
              email: log.executor.email,
            }
          : null,
        action: log.action,
        objectType: log.objectType,
        objectId: log.objectId?._id || log.objectId,
        objectName: log.objectId?.name || log.objectId?.username || null,
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
