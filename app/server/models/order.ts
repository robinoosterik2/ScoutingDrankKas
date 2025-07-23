import type { Model, Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import Log from "./log";
import User from "./user";
import { LOG_CATEGORIES, LOG_ACTIONS } from "./constants/log.constants";

interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  count: number;
}

interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  total: number;
  bartender: mongoose.Types.ObjectId;
}

interface IOrderModel extends Model<IOrder> {
  createFromRequestBody: (bodyData: {
    products: IOrderProduct[];
    userId: mongoose.Types.ObjectId;
    total: number;
    bartenderId: mongoose.Types.ObjectId;
  }) => Promise<IOrder>;
}

const OrderProductSchema = new Schema<IOrderProduct>({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  count: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [OrderProductSchema],
    total: {
      type: Number,
      required: true,
    },
    bartender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.statics.createFromRequestBody = async function (bodyData: {
  products: IOrderProduct[];
  userId: mongoose.Types.ObjectId;
  total: number;
  bartenderId: mongoose.Types.ObjectId;
}) {
  const products = bodyData.products.map((item: IOrderProduct) => ({
    product: item.productId,
    count: item.count,
  }));

  const user = await User.findById(bodyData.userId);
  if (!user) {
    throw new Error("User not found");
  }
  await user.raise(-bodyData.total);

  const order = new Order({
    user: bodyData.userId,
    products: products,
    total: bodyData.total,
    bartender: bodyData.bartenderId,
  });

  const log = new Log({
    executor: bodyData.userId,
    action: LOG_ACTIONS.ORDER_CREATED,
    targetObject: {
      type: "Order",
      id: order._id,
      snapshot: order.toObject(),
    },
    changes: [
      {
        field: "user",
        oldValue: null,
        newValue: order.user,
      },
      {
        field: "products",
        oldValue: null,
        newValue: order.products,
      },
      {
        field: "total",
        oldValue: null,
        newValue: order.total,
      },
      {
        field: "bartender",
        oldValue: null,
        newValue: order.bartender,
      },
    ],
    description: `User bought products worth ${bodyData.total}`,
    category: LOG_CATEGORIES.ORDER,
  });
  await log.save();

  return order;
};

// Populate helper method
OrderSchema.methods.populateAll = function () {
  return this.populate("user")
    .populate("bartender")
    .populate("products.product");
};

export const Order =
  (mongoose.models.Order as IOrderModel) ||
  mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);
