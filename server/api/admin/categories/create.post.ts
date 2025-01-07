import { Category } from '@/server/models/category';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { name, ageRestriction } = body;
        let categoryExists = await Category.findOne({ "name": name });
        console.log(categoryExists);
        if (categoryExists) {
            throw createError({ statusCode: 400, statusMessage: "Category already exists" });
        }
        let category = new Category({ name, ageRestriction });
        await category.save();
        return body;
    } catch (error) {
        console.error("Failed to create category", error);
        throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
    }
});