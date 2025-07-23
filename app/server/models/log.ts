import mongoose, { Schema } from "mongoose";
import {
  LOG_ACTIONS,
  LOG_LEVELS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
  LOG_TAGS,
} from "./constants/log.constants";

import type {
  ILog,
  ILogChange,
  ILogMetadata,
  ILogModel,
  ITargetObject,
} from "./interfaces/log.interface";

const LogSchema = new Schema<ILog>(
  {
    executor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: LOG_ACTIONS,
      required: true,
    },
    level: {
      type: String,
      enum: LOG_LEVELS,
      default: LOG_LEVELS.INFO,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: LOG_CATEGORIES,
      index: true,
    },
    targetObject: {
      type: {
        type: String,
        enum: LOG_TARGET_OBJECTS,
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: function (targetObj: string) {
          return targetObj !== "System";
        },
      },
      // Store relevant object data for reference
      snapshot: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    changes: [
      {
        field: {
          type: String,
          required: true,
        },
        oldValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        newValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
    ],
    description: {
      type: String,
      required: true,
    },

    metadata: {
      request: {
        method: String,
        url: String,
        tags: [
          {
            type: String,
            lowercase: true,
            trim: true,
          },
        ],
        userAgent: String,
        ip: String,
        headers: mongoose.Schema.Types.Mixed,
      },

      session: {
        id: String,
        duration: Number,
      },

      performance: {
        duration: Number,
        memoryUsage: Number,
        dbQueries: Number,
      },
      error: {
        message: String,
        stack: String,
        code: String,
      },

      custom: mongoose.Schema.Types.Mixed,
    },

    retentionUntil: {
      type: Date,
      default: function () {
        const now = new Date();
        return new Date(now.setFullYear(now.getFullYear() + 1));
      },
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        enum: Object.values(LOG_TAGS),
      },
    ],
  },
  {
    timestamps: true,
  }
);

LogSchema.statics.createLog = async function (params: {
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
}) {
  const log = new this({
    executor: params.executor,
    action: params.action,
    level: params.level,
    category: params.category,
    targetObject: params.targetObject,
    changes: params.changes,
    description: params.description,
    metadata: params.metadata,
    tags: params.tags,
    severity: params.severity,
    containsSensitiveData: params.containsSensitiveData,
  });

  return await log.save();
};
LogSchema.statics.findLogs = async function (options: {
  executor?: mongoose.Types.ObjectId;
  action?: LOG_ACTIONS;
  level?: LOG_LEVELS;
  category?: LOG_CATEGORIES;
  targetType?: LOG_TARGET_OBJECTS;
  targetId?: mongoose.Types.ObjectId;
  startDate?: Date | string;
  endDate?: Date | string;
  tags?: string[];
  limit?: number;
  skip?: number;
  sort?: any;
}): Promise<ILog[]> {
  const query: any = {};

  if (options.executor) query.executor = options.executor;
  if (options.action) query.action = options.action;
  if (options.level) query.level = options.level;
  if (options.category) query.category = options.category;
  if (options.targetType) query["targetObject.type"] = options.targetType;
  if (options.targetId) query["targetObject.id"] = options.targetId;
  if (options.tags) query.tags = { $in: options.tags };

  // Date range filtering
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      query.createdAt.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      query.createdAt.$lte = new Date(options.endDate);
    }
  }

  return await this.find(query)
    .limit(options.limit || 50)
    .skip(options.skip || 0)
    .sort(options.sort || { createdAt: -1 });
};

const Log: ILogModel = mongoose.models.Log
  ? (mongoose.models.Log as ILogModel)
  : mongoose.model<ILog, ILogModel>("Log", LogSchema);
export default Log;
