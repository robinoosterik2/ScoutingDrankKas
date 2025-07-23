import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  ageRestriction: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    ageRestriction: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Category =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
