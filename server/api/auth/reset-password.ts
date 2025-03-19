import crypto from 'crypto'
import { User } from '~/server/models/user'

export default defineEventHandler(async (event) => {
	// Parse request body
	const { token, newPassword } = await readBody<{ token: string, newPassword: string }>(event)

	if (!token || !newPassword) {
		throw createError({ statusCode: 400, message: 'Token and new password are required' })
	}

	// Hash the token to match stored hash
	const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

	// Find the user with matching token and check expiration
	const user = await User.findOne({
		resetPasswordToken: tokenHash,
		resetPasswordExpires: { $gt: new Date() }
	})

	if (!user) {
		throw createError({ statusCode: 400, message: 'Invalid or expired token' })
	}

	// Update the password and clear reset token
	user.password = await hashPassword(newPassword)
	user.resetPasswordToken = undefined
	user.resetPasswordExpires = undefined
	await user.save()

	return { success: true, message: 'Password reset successful' }
})
