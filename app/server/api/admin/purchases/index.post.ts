import { defineEventHandler, readBody, createError } from "h3";
import { Purchase } from "~/server/models/purchase";
import { Product } from "~/server/models/product";

export default defineEventHandler(async (event) => {
  try {
    // Read and validate request body
    const body = await readBody(event);
    console.log(body);
    if (!body.productId || !body.quantity || body.price === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Missing required fields: productId, quantity, and price are required",
      });
    }

    // Verify product exists
    const product = await Product.findById(body.productId);
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: "Product not found",
      });
    }

    const session = await getUserSession(event);

    // Create new purchase
    const purchaseDate = body.dayOfOrder
      ? new Date(body.dayOfOrder)
      : new Date();
    const dayOfOrder = purchaseDate;

    const purchase = new Purchase({
      userId: session.user,
      productId: body.productId,
      quantity: body.quantity,
      price: body.price,
      notes: body.notes || "",
      dayOfOrder: dayOfOrder,
      packSize: body.packSize,
      packQuantity: body.packQuantity,
      purchaseDate: purchaseDate,
    });

    // Save purchase
    await purchase.save();

    // Update product stock
    product.stock = (product.stock || 0) + body.quantity;
    await product.save();

    // Return created purchase with populated fields
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("productId", "name price packSize")
      .populate("userId", "firstName lastName");

    return {
      success: true,
      data: populatedPurchase,
    };
  } catch (error: any) {
    console.error("Error creating purchase:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Failed to create purchase",
      data: error.data,
    });
  }
});
