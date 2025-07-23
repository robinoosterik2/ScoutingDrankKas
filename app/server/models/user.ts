import {
  LOG_ACTIONS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
} from "./constants/log.constants";
import type { Document, Model, PopulatedDoc } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type { ICustomRole } from "./customRole";
import type { ISettings } from "./settings";

interface IUser extends Document {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  loggedInAt: Date;
  active: boolean;
  balance: number;
  role: PopulatedDoc<ICustomRole> | mongoose.Types.ObjectId;
  settings: PopulatedDoc<ISettings> | mongoose.Types.ObjectId;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  raise(amount: number): Promise<IUser>;
}

interface IUserModel extends Model<IUser> {
  logAction(action: typeof LOG_ACTIONS, description: string): Promise<void>;
  hasPermission(userId: string, permission: string): Promise<boolean>;
  isAdministrator(userId: string): Promise<boolean>;
  isStam(userId: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    loggedInAt: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
      default: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomRole", // Reference to the Role model
    },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Settings", // Reference to the Settings model
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

UserSchema.methods.logAction = async function (
  action: keyof typeof LOG_ACTIONS,
  description: string
) {
  // Dynamic import to avoid circular dependency
  const { default: Log } = await import("./log");

  const log = new Log({
    executor: this._id,
    action: action,
    category: LOG_CATEGORIES.USER,
    targetObject: {
      type: LOG_TARGET_OBJECTS.USER,
      id: this._id,
      snapshot: this.toObject(),
    },
    description: description,
  });
  await log.save();
};

// Pre-save hook to hash the password before saving the user
UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      if (
        !this.password ||
        this.password.length < 8 ||
        !this.username ||
        !this.email ||
        !this.firstName ||
        !this.lastName
      ) {
        throw new Error(
          "Password, username, email, firstName and lastName are required"
        );
      }
      // all to lowercase
      this.username = this.username.toLowerCase();
      this.email = this.email.toLowerCase();
      this.firstName = this.firstName.toLowerCase();
      this.lastName = this.lastName.toLowerCase();
      this.password = await hashPassword(this.password);

      const { default: Log } = await import("./log");

      const log = new Log({
        executor: this._id,
        action: LOG_ACTIONS.USER_CREATED,
        targetObject: {
          type: LOG_TARGET_OBJECTS.USER,
          id: this._id,
          snapshot: this.toObject(),
        },
        description: "User created",
        category: LOG_CATEGORIES.USER,
      });
      await log.save();
      next();
    } catch (error) {
      console.error("Error hashing password:", error);
      next(error as Error);
    }
  } else {
    next();
  }
});

// Method to log login action
UserSchema.methods.logLogin = async function () {
  await this.logAction(LOG_ACTIONS.USER_LOGIN, "User logged in");
};

UserSchema.methods.raise = function (amount: number) {
  try {
    this.balance += amount;
    return this.save();
  } catch (error) {
    console.error("Error in raise method:", error);
    throw error;
  }
};

/**
 * Check if a user has a specific permission
 * @param userId The ID of the user to check
 * @param permission The permission to check for (e.g., 'admin', 'stam')
 * @returns Promise<boolean> True if the user has the permission, false otherwise
 */
UserSchema.statics.hasPermission = async function (
  userId: string,
  permission: string
) {
  const user = await this.findById(userId).populate("role");

  if (!user || !user.role) {
    return false;
  }

  const role = user.role;
  if (role instanceof mongoose.Types.ObjectId) {
    console.error("Role not populated");
    return false;
  }

  return (
    Array.isArray(role.rolePermissions) &&
    role.rolePermissions.includes(permission)
  );
};

/**
 * Check if a user has administrator privileges
 * @deprecated Use hasPermission(userId, 'admin') instead
 */
UserSchema.statics.isAdministrator = async function (userId: string) {
  return this.hasPermission(userId, "admin");
};

/**
 * Check if a user has stam privileges
 * @deprecated Use hasPermission(userId, 'stam') instead
 */
UserSchema.statics.isStam = async function (userId: string) {
  return this.hasPermission(userId, "stam");
};

const User: IUserModel = mongoose.models.User
  ? (mongoose.models.User as IUserModel)
  : mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;
