import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ICustomRole extends Document {
  roleName: string;
  roleDescription: string;
  rolePermissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomRoleSchema = new Schema<ICustomRole>(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
    },
    roleDescription: {
      type: String,
      required: true,
    },
    rolePermissions: {
      type: [String],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CustomRole =
  mongoose.models.CustomRole ||
  mongoose.model<ICustomRole>("CustomRole", CustomRoleSchema);
