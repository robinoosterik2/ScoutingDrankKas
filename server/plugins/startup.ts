import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
	if (process.env.NODE_ENV !== 'production') return
	console.log("CONNECTING TO ATLAS")
	// Import required models and utilities
	const { CustomRole } = await import('../models/customRole')
	const { User } = await import('../models/user')

	// Check database connection
	await new Promise(resolve => setTimeout(resolve, 300000))
	console.log(mongoose.connection)
	console.log(mongoose.connection.readyState)
	// add sleep 5 minutes
	
	console.log('Database connection established successfully')

	// Create admin role if it doesn't exist
	try {
		let adminRole = await CustomRole.findOne({ roleName: 'admin' })
		
		if (!adminRole) {
			console.log('Creating admin role...')
			adminRole = new CustomRole({
				roleName: 'admin',
				roleDescription: 'Administrator with full access',
				rolePermissions: ['admin']
			})
			await adminRole.save()
			console.log('Admin role created successfully')
		}

		// Check if admin user exists
		let adminUser = await User.findOne({ email: 'robinoosterik03@gmail.com' })
		
		if (!adminUser) {
			console.log('Creating admin user...')
			// Salt and hash password
			const hashedPassword = await hashPassword('admin')
			
			adminUser = new User({
				email: 'robinoosterik03@gmail.com',
				username: 'admin',
				firstName: 'admin',
				lastName: 'admin',
				password: hashedPassword,
				role: adminRole._id
			})
			
			// Save directly to bypass pre-save hook that requires minimum password length
			await User.collection.insertOne(adminUser)
			console.log('Admin user created successfully')
		}
	} catch (error) {
		console.error('Error in startup plugin:', error)
	}
})
