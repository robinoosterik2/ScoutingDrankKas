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
    let totalInCents = 0; // Use an integer for summing cents
    // handle products
    for (const product of body.products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        throw createError({ statusCode: 400, statusMessage: "Product not found" });
      }
      // Stock check
      if (productData.stock < product.count) {
        throw createError({ statusCode: 400, statusMessage: `Insufficient stock for product: ${productData.name}. Available: ${productData.stock}, Requested: ${product.count}` });
      }
      // Decrement stock
      productData.stock -= product.count;
      // Convert product price to cents to avoid floating point arithmetic during summation
      // Math.round is used to handle potential tiny inaccuracies if productData.price itself is a float like 1.9900000000000002
      const priceInCents = Math.round(productData.price * 100);
      totalInCents += priceInCents * product.count; // Perform calculation with integers

      console.log(productData)
      await productData.updateOrderMetrics(product.count);
    }
    console.log(totalInCents); // This will be the total in cents, e.g., 1234 for €12.34

    // Convert the total in cents back to a decimal format (e.g., euros)
    const finalTotalDecimal = totalInCents / 100;
    // Store the total as a number, ensuring it's represented with up to two decimal places,
    // consistent with the original parseFloat(total.toFixed(2))
    body.total = parseFloat(finalTotalDecimal.toFixed(2));
    console.log(body.total);
    const order = await Order.createFromRequestBody(body);
    await order.save();
    return { message: "Order created successfully" };
  } catch (error) {
    console.log(error)
    throw createError({ statusCode: 500, statusMessage: "Error while creating new order" });
  }
});