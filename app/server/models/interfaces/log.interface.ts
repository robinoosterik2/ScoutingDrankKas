import type { Document, Model } from "mongoose";
import type mongoose from "mongoose";
import type {
  LOG_ACTIONS,
  LOG_LEVELS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
} from "../constants/log.constants";

interface ILogChange {
  field: string;
  oldValue?: any;
  newValue?: any;
}

interface ITargetObject {
  type: LOG_TARGET_OBJECTS;
  id?: mongoose.Types.ObjectId;
  snapshot?: any;
}

interface ILogMetadata {
  request?: {
    method?: string;
    url?: string;
    userAgent?: string;
    ip?: string;
    headers?: any;
  };
  session?: {
    id?: string;
    duration?: number;
  };
  performance?: {
    duration?: number;
    memoryUsage?: number;
    dbQueries?: number;
  };
  error?: {
    message?: string;
    stack?: string;
    code?: string;
  };
  custom?: any;
}

interface ILog extends Document {
  executor?: mongoose.Types.ObjectId;
  action: LOG_ACTIONS;
  level: LOG_LEVELS;
  category: LOG_CATEGORIES;
  targetObject: ITargetObject;
  changes: ILogChange[];
  description: string;
  metadata: ILogMetadata;
  tags: string[];
  severity: "low" | "medium" | "high" | "critical";
  containsSensitiveData: boolean;
  retentionUntil: Date;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  formattedTimestamp: string;
  shouldRetain(): boolean;
}

interface ILogModel extends Model<ILog> {
  createLog(params: {
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
  }): Promise<ILog>;

  findLogs(params: {
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
  }): mongoose.Query<ILog[], ILog>;
}

export type { ILog, ILogModel, ILogChange, ITargetObject, ILogMetadata };
