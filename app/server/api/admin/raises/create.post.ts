import { Raise } from "@/server/models/raise";
import { User } from "@/server/models/user";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
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
    // Convert user.balance from string to number and parse amount as float
    const currentBalance = parseFloat(user.balance.toString());
    const amountToAdd = parseFloat(amount);
    const newBalance = currentBalance + amountToAdd;
    
    // Update the user's balance in the database
    user.balance = newBalance;
    await user.save();
    
    return { newBalance: newBalance }
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
  }
});
