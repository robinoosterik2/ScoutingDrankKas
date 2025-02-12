import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
	// Parse the request body to extract the email
	const { email } = await readBody<{ email: string }>(event)
	if (!email) {
		throw createError({ statusCode: 400, message: 'Email is required' })
	}

	// Generate a reset token and URL (you should implement token generation and persistence)
	const resetToken = 'someGeneratedToken' // Replace with your token generation logic
	const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}`

	// Create a transporter using Gmail
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_USER,
			pass: process.env.GMAIL_PASS
		}
	})

	// Configure the email options
	const mailOptions = {
		from: process.env.GMAIL_USER,
		to: email,
		subject: 'Password Reset Request',
		text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`
	}

	try {
		const info = await transporter.sendMail(mailOptions)
        console.log(info)
		return { success: true, info }
	} catch (error: any) {
		return { success: false, error: error.message }
	}
})
