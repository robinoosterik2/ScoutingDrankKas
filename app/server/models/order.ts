/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from 'mongoose';
import { Log } from './log';
import { User } from './user';

const OrderProductSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: 1
  }
});

const OrderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [OrderProductSchema],
  total: {
    type: Number,
    required: true,
  },
  bartender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to create order from API request body
export const createFromRequestBody = async function(bodyData: { products: any[]; userId: any; total: number; bartenderId: any; }) {
  const products = bodyData.products.map((item: { productId: any; count: any; }) => ({
    product: item.productId,
    count: item.count
  }));

  const user = await User.findById(bodyData.userId);
  if (!user) {
    throw new Error('User not found');
  }
  await user.raise(-bodyData.total);

  const order = new Order({
    user: bodyData.userId,
    products: products,
    total: bodyData.total,
    bartender: bodyData.bartenderId
  });

  const log = new Log({
    executor: bodyData.userId,
    action: "Buy",
    objectType: "Order",
    objectId: order._id,
    newValue: JSON.stringify(order),
    description: `User bought products worth ${bodyData.total}`
  });
  await log.save();

  return order;
};

// Populate helper method
OrderSchema.methods.populateAll = function() {
  return this.populate('user')
            .populate('bartender')
            .populate('products.product');
};

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);