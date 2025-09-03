import crypto from "crypto";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  // Parse request body
  const { token, newPassword } = await readBody<{
    token: string;
    newPassword: string;
  }>(event);

  if (!token || !newPassword) {
    throw createError({
      statusCode: 400,
      message: "Token and new password are required",
    });
  }

  // Hash the token to match stored hash
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user with matching token and check expiration
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw createError({ statusCode: 400, message: "Invalid or expired token" });
  }

  // Update the password and clear reset token
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null },
  });

  return { success: true, message: "Password reset successful" };
});
