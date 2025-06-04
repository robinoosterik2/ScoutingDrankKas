import { defineEventHandler, readBody, createError } from 'h3';
import { Product } from '@/server/models/product'; // Adjust path if necessary based on project structure
// import { isAdmin } from '@/server/utils/isAdmin'; // Or your project's equivalent for checking admin privileges

export default defineEventHandler(async (event) => {
  // Optional: Add admin check if not handled by a global middleware for /api/admin routes
  // const isAdminUser = await isAdmin(event); // Example, replace with actual admin check
  // if (!isAdminUser) {
  //   throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  // }

  try {
    const body = await readBody(event);
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      throw createError({ statusCode: 400, statusMessage: 'Missing productId or quantity in request body.' });
    }

    const quantityToAdd = parseInt(quantity, 10);
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Quantity must be a positive number.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found.' });
    }

    product.stock += quantityToAdd;
    await product.save();

    return { success: true, message: 'Stock updated successfully.', newStock: product.stock };

  } catch (error: any) {
    // Log the error for server-side debugging
    console.error('Error adding stock:', error);

    // Throw a generic error or a more specific one if possible
    // If error is already an H3 error (like those from createError), rethrow it
    if (error.statusCode) {
        throw error;
    }
    // Ensure createError is available or imported if this part is reached.
    // It's imported at the top, so it should be fine.
    throw createError({ statusCode: 500, statusMessage: 'An error occurred while adding stock.' });
  }
});
