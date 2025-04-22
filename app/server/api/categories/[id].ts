import { defineEventHandler } from 'h3';
import { Category } from '@/server/models/category';

export default defineEventHandler(async (event) => {
    const { id } = event.context.params || {};

    if (!id) {
        throw new Error("Category ID is required");
    }

    const category = await Category.findById(id)

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
});
