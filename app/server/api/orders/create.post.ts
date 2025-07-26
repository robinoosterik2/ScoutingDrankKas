import { defineEventHandler, createError, readBody } from "h3";
import { Order } from "@/server/models/order";
import User from "@/server/models/user";
import { Product } from "@/server/models/product";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // Get the user session
    const session = await getUserSession(event);

    // Find the bartender user to ensure they exist
    const bartender = await User.findById(session.user);
    if (!bartender) {
      throw createError({
        statusCode: 401,
        statusMessage: "Bartender user not found",
      });
    }

    // Find the customer user
    const user = await User.findById(body.userId);
    if (!user) {
      throw createError({ statusCode: 400, statusMessage: "User not found" });
    }

    // Use the bartender's user ID from the session
    body.bartenderId = session.user._id;

    let totalInCents = 0;

    for (const product of body.products) {
      const productData = await Product.findById(product.productId);
      if (!productData) {
        throw createError({
          statusCode: 400,
          statusMessage: "Product not found",
        });
      }
      // statusMessage	"Error while creating new order ValidationError:
      // products.0.product: Path `product` is required."

      totalInCents += productData.price * product.count;

      await productData.updateOrderMetrics(product.count);
    }

    body.total = totalInCents;
    const order = await Order.createFromRequestBody(body);
    await order.save();
    return { message: "Order created successfully" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while creating new order " + error,
    });
  }
});
