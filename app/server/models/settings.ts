import mongoose, { Schema } from "mongoose";

interface ISettings {
  language: string;
  darkMode: boolean;
  speedMode: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    language: {
      type: String,
      required: true,
      default: "en",
    },
    darkMode: {
      type: Boolean,
      required: true,
      default: true,
    },
    speedMode: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: false,
  }
);

export const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
