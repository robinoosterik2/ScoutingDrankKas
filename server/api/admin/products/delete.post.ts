import { defineEventHandler } from 'h3';
import { Product } from '@/server/models/product';

export default defineEventHandler(async (event) => {
    try {

        const body = await readBody(event);
        const id = body.productId
        let product = await Product.findById(id)
        if (!product) {
            throw createError({ statusCode: 400, statusMessage: "Product doesn't exist"})
        } else {
            await Product.findByIdAndDelete(id)
            return {message: "successfully deleted product: " + product.name}
        }
    } catch {
        throw createError({ statusCode: 500, statusMessage: "Error deleting product"})
    }
});
