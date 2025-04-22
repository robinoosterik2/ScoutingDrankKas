import { Raise } from "@/server/models/raise";
import { User } from "@/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log(body)
    const session = await getUserSession(event);
    const admin = session.user
    const userId = body.userId
    const user = await User.findById(userId)
    const amount = body.amount

    if (body.userid === admin._id) {
        return createError({ statusCode: 500, statusMessage: "Cannot top up yourself for security reasons"});
    };
    const raise = new Raise({user: userId, amount: amount, raiser: admin._id})
    await raise.save()
    return {message: "successfully topped up"}
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
});
