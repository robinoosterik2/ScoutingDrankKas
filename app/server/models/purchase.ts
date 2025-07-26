import mongoose, { Schema } from "mongoose";

interface IPurchase {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  purchaseDate: Date;
  notes: string;
  packSize?: number;
  packQuantity?: number;
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
  purchaseDate: {
    type: Date,
    default: Date.now,
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
});

export const Purchase =
  mongoose.models.Purchase ||
  mongoose.model<IPurchase>("Purchase", PurchaseSchema);
