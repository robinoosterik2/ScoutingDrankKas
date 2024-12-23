import mongoose, { Schema, model } from 'mongoose';

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
OrderSchema.statics.createFromRequestBody = async function(bodyData) {
  const products = bodyData.products.map(item => ({
    product: item.productId,
    count: item.count
  }));

  const user = await mongoose.models.User.findById(bodyData.userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.balance -= bodyData.total;
  await user.save();

  return new this({
    user: bodyData.userId,
    products: products,
    total: bodyData.total,
    bartender: bodyData.bartenderId
  });
};

// Populate helper method
OrderSchema.methods.populateAll = function() {
  return this.populate('user')
            .populate('bartender')
            .populate('products.product');
};

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);