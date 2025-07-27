import mongoose, { Schema } from "mongoose";

interface IPurchase {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  notes: string;
  packSize?: number;
  packQuantity?: number;
  dayOfOrder: Date; // The actual day the purchase was made (without time)
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    default: "",
  },
  packSize: {
    type: Number,
    required: false,
    min: 1,
    default: null,
  },
  packQuantity: {
    type: Number,
    required: false,
    min: 1,
    default: null,
  },
  dayOfOrder: {
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    },
  },
});

export const Purchase =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
