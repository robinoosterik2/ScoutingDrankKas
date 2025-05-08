import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
	if (process.env.NODE_ENV !== 'production') return
	if (!process.env.MONGODB_URI) {
		console.log("MONGODB_URI is not defined")
		return
	}

	try {

		// Wait for the connection to be established
		let connectionRetries = 5;
		while (mongoose.connection.readyState !== 1 && connectionRetries > 0) {
			console.log(`Waiting for MongoDB connection... retries left: ${connectionRetries}`);
			await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
			connectionRetries--;
		}

		if (mongoose.connection.readyState !== 1) {
			console.error('Failed to connect to MongoDB after multiple retries.');
			return;
		}
		console.log('MongoDB connection established successfully');

	} catch (error) {
		console.error('Error connecting to MongoDB:', error)
		return
	}

	// Import required models and utilities
	const { CustomRole } = await import('../models/customRole')
	const { User } = await import('../models/user')

	
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
