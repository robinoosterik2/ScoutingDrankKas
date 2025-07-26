import mongoose, { Schema } from "mongoose";
import User from "./user";
import Log from "./log";
import {
  LOG_ACTIONS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
} from "./constants/log.constants";

export enum PaymentMethod {
  CASH = 'cash',
  PIN = 'pin'
}

interface IRaise {
  user: mongoose.Types.ObjectId;
  amount: number;
  raiser: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
}

const RaiseSchema = new Schema<IRaise>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    raiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      default: PaymentMethod.CASH,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

RaiseSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const user = await User.findById(this.user);
      if (!user) {
        throw new Error("User cannot be found");
      }
      await user.raise(this.amount);

      const description = this.paymentMethod === PaymentMethod.CASH ? "Cash raise" : "Bank raise (PIN)";

      const log = new Log({
        executor: this.raiser,
        action: LOG_ACTIONS.RAISE_RECEIVED,
        targetObject: {
          type: LOG_TARGET_OBJECTS.USER,
          id: this.user,
          snapshot: user.toObject(),
        },
        changes: [
          {
            field: "balance",
            oldValue: user.balance,
            newValue: user.balance + this.amount,
          },
        ],
        description: description,
        category: LOG_CATEGORIES.USER,
      });
      await log.save();

      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const Raise =
  mongoose.models.Raise || mongoose.model<IRaise>("Raise", RaiseSchema);
