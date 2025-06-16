import { defineEventHandler } from 'h3';
import { Product } from '@/server/models/product';
import fs from 'node:fs/promises';
import path from 'node:path';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const id = body.productId;

        if (!id) {
            throw createError({ statusCode: 400, statusMessage: "Product ID is required" });
        }

        const product = await Product.findById(id);

        if (!product) {
            throw createError({ statusCode: 404, statusMessage: "Product not found" });
        }

        // Attempt to delete the image file
        if (product.imageUrl && product.imageUrl !== '/images/placeholder.jpg') {
            const imagePath = path.join(process.cwd(), 'public', product.imageUrl);
            try {
                await fs.unlink(imagePath);
            } catch (imageError: any) {
                // Log the error but don't prevent product deletion
                // Common errors: file not found (ENOENT), permission issues
                if (imageError.code === 'ENOENT') {
                    console.warn(`Image file not found, could not delete: ${imagePath}`);
                } else {
                    console.error(`Error deleting image ${imagePath}:`, imageError);
                }
            }
        }

        await Product.findByIdAndDelete(id);
        return { message: `Successfully deleted product: ${product.name}` };

    } catch (error: any) {
        // If it's already an H3 error, rethrow it
        if (error.statusCode) {
            throw error;
        }
        // Otherwise, wrap it in a generic 500 error
        console.error("Error in delete.post.ts:", error);
        throw createError({ statusCode: 500, statusMessage: "Error deleting product" });
    }
});
