import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "~/server/models/user";

export default defineEventHandler(async (event) => {
  // Parse the request body to extract the email
  const { email } = await readBody<{ email: string }>(event);
  if (!email) {
    throw createError({ statusCode: 400, message: "Email is required" });
  }

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw createError({ statusCode: 404, message: "User not found" });
  }

  // Generate a secure reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour

  // Store token in the user document
  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // Construct the reset URL
  const baseUrl = process.env.BASE_URL || "http://localhost";
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  console.log(process.env.GMAIL_USER);
  console.log(process.env.GMAIL_PASS);

  // Configure email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Email content
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. If you haven't requested a reset password link you can ignore this email. Click the link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reset email sent" };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: "Error sending email" + error,
    });
  }
});
