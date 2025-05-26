import mongoose, { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: true,
    set: value => {
      if (typeof value === 'string' || value.toString().includes('.') || value.toString().includes(',')) {
        return Math.round(parseFloat(value.toString()) * 100);
      }
      return value;
    },
    get: value => (value / 100).toFixed(2),
  },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category'
  },
  ageRestriction: {
    type: Boolean,
    default: false,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  imageUrl: {
    type: String,
    required: true,
    default: "/images/placeholder.jpg"
  },
  // Popularity tracking fields
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalQuantitySold: {
    type: Number,
    default: 0,
  },
  // Recent order tracking for trending calculation
  recentOrders: [{
    date: { type: Date, required: true },
    quantity: { type: Number, required: true }
  }],
  popularityScore: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true },
});

// Index for efficient sorting by popularity
ProductSchema.index({ popularityScore: -1 });

// Method to update order metrics
ProductSchema.methods.updateOrderMetrics = async function(quantity: any) {
  this.totalOrders += 1;
  this.totalQuantitySold += quantity;
  this.stock -= quantity;
  
  // Add to recent orders
  this.recentOrders.push({
    date: new Date(),
    quantity: quantity
  });
  
  // Keep only last 30 days of orders
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.recentOrders = this.recentOrders.filter(order => order.date >= thirtyDaysAgo);
  
  await this.calculatePopularityScore();
  await this.save();
};

// Calculate popularity score
ProductSchema.methods.calculatePopularityScore = async function() {
  // Calculate recent orders (last 30 days)
  const recentQuantity = this.recentOrders.reduce((sum, order) => sum + order.quantity, 0);
  
  // Weights for different factors
  const weights = {
    recentOrders: 0.7,    // Recent orders have higher weight
    totalOrders: 0.3,     // Historical orders have lower weight
  };
  
  // Calculate popularity score based on recent and total orders
  this.popularityScore = 
    (recentQuantity * weights.recentOrders) +
    (this.totalQuantitySold * weights.totalOrders);
};

// Static method to get popular products
ProductSchema.statics.getPopularProducts = async function(options = {}) {
  const {
    limit = 999,
    category = null,
  } = options;

  const query = {};
  if (category) {
    query.categories = category;
  }

  return this.find(query)
    .sort({ popularityScore: -1 })
    .limit(limit);
};

// Automatically update popularity score daily
if (process.env.NODE_ENV !== 'test') {
  setInterval(async () => {
    const products = await mongoose.model('Product').find({});
    for (const product of products) {
      await product.calculatePopularityScore();
    }
  }, 24 * 60 * 60 * 1000); // Run daily
}

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);