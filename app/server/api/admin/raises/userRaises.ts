import { defineEventHandler } from "h3";
import { Raise } from "@/server/models/raise";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const recentRaises = await Raise.find({ user: body.userId })
      .sort({ createdAt: -1 })
      .limit(body.limit || 5)
      .populate('raiser', 'firstName lastName') // Populate the raiser field with the firstName and lastName of the user
      .exec();
    return recentRaises;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching Raises",
    });
  }
});
