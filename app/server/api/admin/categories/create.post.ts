import { Category } from "@/server/models/category";
import Log from "@/server/models/log";
import {
  LOG_ACTIONS,
  LOG_CATEGORIES,
  LOG_TARGET_OBJECTS,
} from "@/server/models/constants/log.constants";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const user = await getUserSession(event);

    const { name, ageRestriction } = body;
    const categoryExists = await Category.findOne({ name: name });
    if (categoryExists) {
      throw createError({
        statusCode: 400,
        statusMessage: "Category already exists",
      });
    }
    const category = new Category({ name, ageRestriction });
    const log = new Log({
      executor: user.user?._id,
      action: LOG_ACTIONS.CATEGORY_CREATED,
      targetObject: {
        type: LOG_TARGET_OBJECTS.CATEGORY,
        id: category._id,
        snapshot: category.toObject(),
      },
      changes: [
        {
          field: "name",
          oldValue: null,
          newValue: category.name,
        },
        {
          field: "ageRestriction",
          oldValue: null,
          newValue: category.ageRestriction,
        },
      ],
      description: `User created a new category: ${category.name}`,
      category: LOG_CATEGORIES.CATEGORY,
    });
    await log.save();
    await category.save();
    return body;
  } catch (error) {
    console.error("Failed to create category", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
