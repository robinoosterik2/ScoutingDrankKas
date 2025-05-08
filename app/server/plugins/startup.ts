import mongoose from 'mongoose'

// Define a unique symbol for the flag to avoid collisions on the nitroApp object
const adminSetupDoneFlag = Symbol.for('nitro.adminSetupDone');

export default defineNitroPlugin(async (nitroApp) => {
	// @ts-ignore - Allow adding a custom property to nitroApp
	if (nitroApp[adminSetupDoneFlag]) {
		console.log('Startup plugin: Admin setup has already been performed, skipping.');
		return;
	}

	if (!process.env.MONGODB_URI) {
		console.error("Startup plugin: MONGODB_URI is not defined");
		return;
	}

	try {
		console.log('Startup plugin: Waiting for MongoDB connection...');
		let connectionRetries = 10; // Slightly increased retries
		// Check mongoose.connection.readyState directly. nuxt-mongoose should handle the actual connect().
		while (mongoose.connection.readyState !== 1 && connectionRetries > 0) { 
			console.log(`Startup plugin: MongoDB connection state: ${mongoose.connection.readyState}. Retries left: ${connectionRetries}`);
			await new Promise(resolve => setTimeout(resolve, 1500)); // Wait 1.5 seconds
			connectionRetries--;
		}

		if (mongoose.connection.readyState !== 1) {
			console.error('Startup plugin: Failed to establish MongoDB connection after multiple retries.');
			return;
		}
		console.log('Startup plugin: MongoDB connection established successfully.');

	} catch (error) {
		console.error('Startup plugin: Error while waiting for MongoDB connection:', error);
		return;
	}

	try {
		console.log('Startup plugin: Proceeding with admin role and user setup...');
		// Import models only after connection is confirmed
		const { CustomRole } = await import('../models/customRole');
		const { User } = await import('../models/user');
		// hashPassword should be auto-imported by nuxt-auth-utils on the server-side

		let adminRole = await CustomRole.findOne({ roleName: 'admin' });
		
		if (!adminRole) {
			console.log('Startup plugin: Creating admin role...');
			adminRole = new CustomRole({
				roleName: 'admin',
				roleDescription: 'Administrator with full access',
				rolePermissions: ['admin']
			});
			await adminRole.save();
			console.log('Startup plugin: Admin role created successfully');
		}

		let adminUser = await User.findOne({ email: 'robinoosterik03@gmail.com' });
		
		if (!adminUser) {
			console.log('Startup plugin: Creating admin user...');
			const hashedPassword = await hashPassword('admin'); // Provided by nuxt-auth-utils
			
			adminUser = new User({
				email: 'robinoosterik03@gmail.com',
				username: 'admin',
				firstName: 'admin',
				lastName: 'admin',
				password: hashedPassword,
				role: adminRole._id // Ensure adminRole is defined (it will be, from findOne or new)
			});
			
			await User.collection.insertOne(adminUser);
			console.log('Startup plugin: Admin user created successfully');
		}

		// @ts-ignore - Set the flag on nitroApp after successful setup
		nitroApp[adminSetupDoneFlag] = true;
		console.log('Startup plugin: Admin setup performed and flag set.');

	} catch (error) {
		console.error('Startup plugin: Error during admin setup:', error);
		// Do not set the flag if setup fails, so it might be retried on a subsequent HMR, 
		// or log this as a critical failure.
	}
});
