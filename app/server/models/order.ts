import type { Model, Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import Log from "./log";
import User from "./user";
import { LOG_CATEGORIES, LOG_ACTIONS } from "./constants/log.constants";
import { useMoney } from "~/composables/useMoney";
const { format } = useMoney();

interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  count: number;
}

interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  total: number;
  bartender: mongoose.Types.ObjectId;
  dayOfOrder: Date; // The actual day the order was placed (without time)
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
  productId: {
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
    dayOfOrder: {
      type: Date,
      required: true,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      },
    },
  },
  {
    timestamps: true,
  }
);

// Apply 8 AM rule: if time is before 8 AM, set to previous day
const adjustFor8AMRule = (date: Date): Date => {
  const amsterdamTime = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
  );
  if (amsterdamTime.getHours() < 8) {
    const adjustedDate = new Date(amsterdamTime);
    adjustedDate.setDate(adjustedDate.getDate() - 1);
    return adjustedDate;
  }
  return amsterdamTime;
};

OrderSchema.statics.createFromRequestBody = async function (bodyData: {
  products: IOrderProduct[];
  userId: mongoose.Types.ObjectId;
  total: number;
  bartenderId: mongoose.Types.ObjectId;
}) {
  const products = bodyData.products.map((item: IOrderProduct) => ({
    productId: item.productId,
    count: item.count,
  }));

  const user = await User.findById(bodyData.userId);
  if (!user) {
    throw new Error("User not found");
  }
  await user.raise(-bodyData.total);

  // Get current date and apply 8 AM rule
  const now = new Date();
  const dayOfOrder = adjustFor8AMRule(now);

  const order = new Order({
    user: bodyData.userId,
    products: products,
    total: bodyData.total,
    bartender: bodyData.bartenderId,
    dayOfOrder: new Date(
      dayOfOrder.getFullYear(),
      dayOfOrder.getMonth(),
      dayOfOrder.getDate()
    ),
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
    description: `User bought products worth ${format(bodyData.total)}`,
    category: LOG_CATEGORIES.ORDER,
  });
  await log.save();

  return order;
};

// Populate helper method
OrderSchema.methods.populateAll = function () {
  return this.populate("user")
    .populate("bartender")
    .populate("products.productId");
};

export const Order =
  (mongoose.models.Order as IOrderModel) ||
  mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);
