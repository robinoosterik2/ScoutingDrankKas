import { Category } from '@/server/models/category';
import { Log } from '@/server/models/log';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const user = await getUserSession(event);

        const { name, ageRestriction } = body;
        const categoryExists = await Category.findOne({ "name": name });
        if (categoryExists) {
            throw createError({ statusCode: 400, statusMessage: "Category already exists" });
        }
        const category = new Category({ name, ageRestriction });
        const log = new Log({
            executor: user.user?._id,
            action: "Buy",
            objectType: "Order",
            objectId: category._id,
            newValue: JSON.stringify(category),
            description: `User created a new category: ${category.name}`,
          });
        await log.save();
        await category.save();
        return body;
    } catch (error) {
        console.error("Failed to create category", error);
        throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
    }
});