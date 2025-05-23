import { defineEventHandler } from "h3";
import { User } from "@/server/models/user";

export default defineEventHandler(async () => {
  const users = await User.find({ active: true })
    .populate("role");
  return users.map((user) => ({
    _id: user._id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    balance: user.balance,
  }));
});
