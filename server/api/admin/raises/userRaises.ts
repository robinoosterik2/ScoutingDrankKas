import { defineEventHandler } from "h3";
import { Raise } from "@/server/models/raise";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const recentRaises = await Raise.find({ userId: body.userId })
      .sort({ createdAt: -1 })
      .limit(body.limit || 5)
      .exec();
    return recentRaises;
  } catch (error) {
    console.log(error)
    throw createError({
      statusCode: 500,
      statusMessage: "Error while fetching Raises",
    });
  }
});
