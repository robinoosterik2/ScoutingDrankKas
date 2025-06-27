import { defineEventHandler } from "h3";
import { Order } from "@/server/models/order";
import { Product } from "@/server/models/product";
import { User } from "@/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const { id } = await readBody(event);
    
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: "Order ID is required" });
    }

    // First, get the order to be deleted
    const order = await Order.findById(id);
    
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: "Order not found" });
    }

    // Refund user's balance
    const user = await User.findById(order.userId);
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: "User not found" });
    }
    
    // Add the order total back to user's balance
    await user.raise(order.total);

    // Revert product metrics for each product in the order
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        // Revert the order metrics
        product.totalOrders -= 1;
        product.totalQuantitySold -= item.count;
        product.stock += item.count;
        
        // Remove this order from recent orders
        product.recentOrders = product.recentOrders.filter(
          (orderItem: { date: Date; quantity: number }) => !(orderItem.date.getTime() === order.createdAt.getTime() && orderItem.quantity === item.count)
        );
        
        // Recalculate popularity score
        await product.calculatePopularityScore();
        await product.save();
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return { success: true, message: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500;
    throw createError({
      statusCode,
      statusMessage: errorMessage
    });
  }
});