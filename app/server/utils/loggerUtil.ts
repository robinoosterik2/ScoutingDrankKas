import type {
  ILog,
  ILogChange,
  ITargetObject,
  ILogMetadata,
} from "../models/interfaces/log.interface";
import {
  LOG_ACTIONS,
  LOG_LEVELS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
} from "../models/constants/log.constants";
import type mongoose from "mongoose";
import Log from "../models/log";

// Define interfaces for the logger
interface IUser {
  id: mongoose.Types.ObjectId;
  username: string;
  role: string;
  email?: string;
  toObject?(): any;
}

interface IProduct {
  id: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  stock?: number;
  toObject?(): any;
}

interface IOrder {
  id: mongoose.Types.ObjectId;
  total?: number;
  items?: any[];
  toObject?(): any;
}

interface IRequest {
  method?: string;
  url?: string;
  headers: { [key: string]: string };
  connection?: { remoteAddress?: string };
}

interface LogParams {
  executor?: mongoose.Types.ObjectId | null;
  action: LOG_ACTIONS;
  level?: LOG_LEVELS;
  category?: LOG_CATEGORIES;
  targetObject: ITargetObject;
  changes?: ILogChange[];
  description: string;
  metadata?: ILogMetadata;
  tags?: string[];
  severity?: "low" | "medium" | "high" | "critical";
  containsSensitiveData?: boolean;
  request?: IRequest | null;
}

class Logger {
  private defaultExecutor: mongoose.Types.ObjectId | null;

  constructor(defaultExecutor: mongoose.Types.ObjectId | null = null) {
    this.defaultExecutor = defaultExecutor;
  }

  // Generic log method
  async log({
    executor = this.defaultExecutor,
    action,
    level = LOG_LEVELS.INFO,
    category,
    targetObject,
    changes = [],
    description,
    metadata = {},
    tags = [],
    severity = "low",
    containsSensitiveData = false,
    request = null,
  }: LogParams): Promise<ILog> {
    try {
      const log = await Log.createLog({
        executor,
        action,
        level,
        category,
        targetObject,
        changes,
        description,
        metadata: {
          ...metadata,
          request: request ? this.sanitizeHeaders(request.headers) : undefined,
        },
        tags,
        severity,
        containsSensitiveData,
      });

      return log;
    } catch (error) {
      console.error("Failed to create log:", error);
      throw error;
    }
  }

  // Convenience methods for different log levels
  async debug(params: Omit<LogParams, "level">): Promise<ILog> {
    return this.log({ ...params, level: LOG_LEVELS.DEBUG });
  }

  async info(params: Omit<LogParams, "level">): Promise<ILog> {
    return this.log({ ...params, level: LOG_LEVELS.INFO });
  }

  async warn(params: Omit<LogParams, "level" | "severity">): Promise<ILog> {
    return this.log({ ...params, level: LOG_LEVELS.WARN, severity: "medium" });
  }

  async error(params: Omit<LogParams, "level" | "severity">): Promise<ILog> {
    return this.log({ ...params, level: LOG_LEVELS.ERROR, severity: "high" });
  }

  async critical(params: Omit<LogParams, "level" | "severity">): Promise<ILog> {
    return this.log({
      ...params,
      level: LOG_LEVELS.CRITICAL,
      severity: "critical",
    });
  }

  async logUserAction(
    executor: mongoose.Types.ObjectId | null,
    action: LOG_ACTIONS,
    targetUser: IUser,
    description: string,
    changes: ILogChange[] = [],
    metadata: ILogMetadata = {},
    request: IRequest | null = null
  ): Promise<ILog> {
    return this.log({
      executor,
      action,
      category: LOG_CATEGORIES.USER,
      targetObject: {
        type: LOG_TARGET_OBJECTS.USER,
        id: targetUser.id,
        snapshot: this.createSnapshot(targetUser),
      },
      metadata: {
        ...metadata,
        request: request ? this.sanitizeHeaders(request.headers) : undefined,
      },
      changes,
      description,
      tags: ["user-management"],
    });
  }

  async logProductAction(
    executor: mongoose.Types.ObjectId | null,
    action: LOG_ACTIONS,
    targetProduct: IProduct,
    description: string,
    changes: ILogChange[] = [],
    metadata: ILogMetadata = {},
    request: IRequest | null = null
  ): Promise<ILog> {
    return this.log({
      executor,
      action,
      category: LOG_CATEGORIES.PRODUCT,
      targetObject: {
        type: LOG_TARGET_OBJECTS.PRODUCT,
        id: targetProduct._id,
        snapshot: this.createSnapshot(targetProduct),
      },
      changes,
      description,
      tags: ["inventory", "product-management"],
      metadata: {
        ...metadata,
        request: request ? this.sanitizeHeaders(request.headers) : undefined,
      },
    });
  }

  async logOrderAction(
    executor: mongoose.Types.ObjectId | null,
    action: LOG_ACTIONS,
    targetOrder: IOrder,
    description: string,
    changes: ILogChange[] = [],
    request: IRequest | null = null
  ): Promise<ILog> {
    const metadata: ILogMetadata = {
      custom: {
        orderValue: targetOrder.total,
        itemCount: targetOrder.items?.length || 0,
      },
    };

    return this.log({
      executor,
      action,
      category: LOG_CATEGORIES.ORDER,
      targetObject: {
        type: LOG_TARGET_OBJECTS.ORDER,
        id: targetOrder._id,
        snapshot: this.createSnapshot(targetOrder),
      },
      changes,
      description,
      metadata,
      tags: ["sales", "order-management"],
      request,
    });
  }

  async logStockChange(
    executor: mongoose.Types.ObjectId | null,
    product: IProduct,
    oldStock: number,
    newStock: number,
    reason: string,
    request: IRequest | null = null
  ): Promise<ILog> {
    const changes: ILogChange[] = [
      {
        field: "stock",
        oldValue: oldStock,
        newValue: newStock,
      },
    ];

    let action: LOG_ACTIONS = LOG_ACTIONS.STOCK_REPLENISHED;
    if (newStock < oldStock) {
      action = LOG_ACTIONS.STOCK_LOWERED;
    }

    return this.log({
      executor,
      action,
      category: LOG_CATEGORIES.INVENTORY,
      targetObject: {
        type: LOG_TARGET_OBJECTS.PRODUCT,
        id: product._id,
        snapshot: { name: product.name, category: product.category },
      },
      changes,
      description: `Stock updated for ${product.name}: ${oldStock} → ${newStock} (${reason})`,
      metadata: {
        request: request ? this.sanitizeHeaders(request.headers) : undefined,
        custom: {
          reason,
          stockDifference: newStock - oldStock,
        },
      },
      tags: ["inventory", "stock-management"],
    });
  }

  async logLogin(
    user: IUser,
    success: boolean,
    request: IRequest | null = null,
    metadata: ILogMetadata = {}
  ): Promise<ILog> {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
    const action = success
      ? LOG_ACTIONS.USER_LOGIN
      : LOG_ACTIONS.UNAUTHORIZED_ACCESS;
    const severity = success ? "low" : "medium";

    return this.log({
      executor: success ? user.id : null,
      action,
      level,
      category: LOG_CATEGORIES.SECURITY,
      targetObject: {
        type: LOG_TARGET_OBJECTS.USER,
        id: user.id,
        snapshot: { username: user.username, role: user.role },
      },
      description: success
        ? `User ${user.username} logged in successfully`
        : `Failed login attempt for ${user.username}`,
      metadata: {
        ...metadata,
        custom: { success },
        request: request ? this.sanitizeHeaders(request.headers) : undefined,
      },
      tags: ["authentication", "security"],
      severity,
    });
  }

  async logSystemError(
    error: Error,
    context: any = {},
    request: IRequest | null = null
  ): Promise<ILog> {
    return this.log({
      action: LOG_ACTIONS.SYSTEM_ERROR,
      level: LOG_LEVELS.ERROR,
      category: LOG_CATEGORIES.SYSTEM,
      targetObject: { type: LOG_TARGET_OBJECTS.SYSTEM },
      description: `System error: ${error.message}`,
      metadata: {
        error: {
          message: error.message,
          stack: error.stack,
          code: (error as any).code,
        },
        custom: context,
        request: request ? this.sanitizeHeaders(request.headers) : undefined,
      },
      tags: ["system", "error"],
      severity: "high",
    });
  }

  // Helper methods
  createSnapshot(object: any): any {
    if (!object) return null;

    // Create a safe snapshot without sensitive data
    const snapshot: any = {};
    const sensitiveFields = ["password", "token", "secret", "key"];

    const objectData = object.toObject ? object.toObject() : object;
    for (const [key, value] of Object.entries(objectData)) {
      if (!sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        snapshot[key] = value;
      }
    }

    return snapshot;
  }

  sanitizeHeaders(headers: { [key: string]: string }): {
    [key: string]: string;
  } {
    const sanitized = { ...headers };
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  // Query methods
  async getRecentLogs(limit: number = 50): Promise<ILog[]> {
    return Log.findLogs({ limit, sort: { createdAt: -1 } });
  }

  async getUserLogs(
    userId: mongoose.Types.ObjectId,
    limit: number = 50
  ): Promise<ILog[]> {
    return Log.findLogs({ executor: userId, limit });
  }

  async getErrorLogs(
    startDate?: Date | string | undefined,
    endDate?: Date | string | undefined
  ): Promise<ILog[]> {
    return Log.findLogs({
      level: LOG_LEVELS.ERROR,
      startDate,
      endDate,
      sort: { createdAt: -1 },
    });
  }

  async getSecurityLogs(
    startDate?: Date | string | undefined,
    endDate?: Date | string | undefined
  ): Promise<ILog[]> {
    return Log.findLogs({
      category: LOG_CATEGORIES.SECURITY,
      startDate,
      endDate,
      sort: { createdAt: -1 },
    });
  }

  // Cleanup method for old logs
  async cleanupOldLogs(): Promise<number> {
    const cutoffDate = new Date();
    const result = await Log.deleteMany({
      retentionUntil: { $lt: cutoffDate },
      archived: false,
    });

    await this.log({
      action: LOG_ACTIONS.SYSTEM_MAINTENANCE,
      category: LOG_CATEGORIES.SYSTEM,
      targetObject: { type: LOG_TARGET_OBJECTS.SYSTEM },
      description: `Cleaned up ${result.deletedCount} old log entries`,
      metadata: { custom: { deletedCount: result.deletedCount } },
    });

    return result.deletedCount;
  }
}

// Middleware function for Express/Nuxt to automatically log requests
export function loggerMiddleware(logger: Logger) {
  return async (req: any, res: any, next: () => void) => {
    const startTime = Date.now();

    // Add logger to request object
    req.logger = logger;

    // Log the request
    const originalJson = res.json;
    res.json = function (data: any) {
      const duration = Date.now() - startTime;

      // Only log errors or important actions
      if (res.statusCode >= 400) {
        logger.error({
          action: LOG_ACTIONS.SYSTEM_ERROR,
          targetObject: { type: LOG_TARGET_OBJECTS.SYSTEM },
          description: `HTTP ${res.statusCode} - ${req.method} ${req.url}`,
          metadata: {
            performance: { duration },
            custom: { statusCode: res.statusCode },
          },
          request: req,
        });
      }

      return originalJson.call(this, data);
    };

    next();
  };
}

export default Logger;

// Create a default logger instance
export const logger = new Logger();
