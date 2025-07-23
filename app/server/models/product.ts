import type { Document, Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

// Define the base interface for the document properties
interface IProductBase {
  name: string;
  description: string;
  price: number;
  categories: mongoose.Types.ObjectId[];
  ageRestriction: boolean;
  stock: number;
  imageUrl: string;
  totalOrders: number;
  totalQuantitySold: number;
  recentOrders: { date: Date; quantity: number }[];
  popularityScore: number;
}

// Define the methods interface
interface IProductMethods {
  calculatePopularityScore(): void;
  updateOrderMetrics(quantity: number): Promise<void>;
}

// Combine the base interface with methods and Document
interface IProduct extends Document, IProductBase, IProductMethods {}

// Define the static methods interface
interface IProductModel extends Model<IProduct> {
  getPopularProducts(options: {
    limit?: number;
    category?: mongoose.Types.ObjectId;
  }): Promise<IProduct[]>;
}

const ProductSchema = new Schema<IProduct>(
  {
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
      type: Number,
      required: true,
      min: 0,
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
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
      default: "/images/placeholder.jpg",
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalQuantitySold: {
      type: Number,
      default: 0,
    },
    recentOrders: [
      {
        date: { type: Date, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    popularityScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

ProductSchema.index({ popularityScore: -1 });

// Fix the updateOrderMetrics method - make it async
ProductSchema.methods.updateOrderMetrics = async function (
  quantity: number
): Promise<void> {
  this.totalOrders += 1;
  this.totalQuantitySold += quantity;
  this.stock -= quantity;
  this.recentOrders.push({
    date: new Date(),
    quantity: quantity,
  });

  // Keep only last 30 days of recent orders
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.recentOrders = this.recentOrders.filter(
    (order: { date: Date }) => order.date >= thirtyDaysAgo
  );

  this.calculatePopularityScore();
  await this.save(); // Await the save operation
};

ProductSchema.methods.calculatePopularityScore = function (): void {
  const recentQuantity = this.recentOrders.reduce(
    (sum: number, order: { quantity: number }) => sum + order.quantity,
    0
  );

  const weights = {
    recentOrders: 0.7,
    totalOrders: 0.3,
  };

  this.popularityScore =
    recentQuantity * weights.recentOrders +
    this.totalQuantitySold * weights.totalOrders;
};

ProductSchema.statics.getPopularProducts = async function (
  options: { limit?: number; category?: mongoose.Types.ObjectId } = {}
): Promise<IProduct[]> {
  const { limit = 999, category } = options;
  const query: { categories?: { $in: mongoose.Types.ObjectId[] } } = {};

  if (category) {
    query.categories = { $in: [category] };
  }

  return this.find(query).sort({ popularityScore: -1 }).limit(limit);
};

// Automatically update popularity score daily
// TODO SETUP CRONJOB
if (process.env.NODE_ENV !== "test") {
  setInterval(async () => {
    const products = await mongoose.model("Product").find({});
    for (const product of products) {
      product.calculatePopularityScore();
      await product.save(); // Also await this save
    }
  }, 24 * 60 * 60 * 1000); // Run daily
}

export const Product =
  (mongoose.models.Product as IProductModel) ||
  mongoose.model<IProduct, IProductModel>("Product", ProductSchema);
