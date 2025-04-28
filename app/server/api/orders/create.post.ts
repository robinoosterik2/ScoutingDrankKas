import { defineEventHandler } from "h3";
import { Order } from "@/server/models/order";
import { User } from "@/server/models/user";
import { Product } from "@/server/models/product";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const bartender = await getUserSession(event);
    const user = await User.findById(body.userId);
    if (!user) {
      throw createError({ statusCode: 400, statusMessage: "User not found" });
    }
    body.bartenderId = bartender.user._id;
    let total = 0;
    // handle products
    for (const product of body.products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        throw createError({ statusCode: 400, statusMessage: "Product not found" });
      }
      total += productData.price * product.count;
      console.log(productData)
      await productData.updateOrderMetrics(product.count);
    }
    console.log(total);
    body.total = parseFloat(total.toFixed(2));
    console.log(body.total);
    const order = await Order.createFromRequestBody(body);
    await order.save();
    return { message: "Order created successfully" };
  } catch (error) {
    console.log(error)
    throw createError({ statusCode: 500, statusMessage: "Error while creating new order" });
  }
});