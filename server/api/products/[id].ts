import { defineEventHandler } from 'h3';
import { Product } from '@/server/models/product';

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    if (!id) {
        throw createError({statusCode: 400, statusMessage: "Product ID is required"});
    }

    const product = Product.findById(id)
    if (!product) {
        throw createError({statuscode: 400, statusMessage: "Product not found"})
    }
    
    return product
});
