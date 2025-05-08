import mongoose from 'mongoose';
import { User } from './server/models/user'; // adjust the path
import { CustomRole } from './server/models/customRole'; // adjust the path

const MONGO_URI = process.env.MONGODB_URI;

async function init() {
	try {
		await mongoose.connect(MONGO_URI);
		await new Promise(resolve => setTimeout(resolve, 300000))

		console.log('Connected to MongoDB');

		let adminRole = await CustomRole.findOne({ roleName: 'admin' });
		if (!adminRole) {
			adminRole = await CustomRole.create({
				roleName: 'admin',
				roleDescription: 'Administrator with full access',
				rolePermissions: ['admin'],
			});
			console.log('Admin role created');
		} else {
			console.log('Admin role already exists');
		}

		let adminUser = await User.findOne({ email: 'robinoosterik03@gmail.com' });
		if (!adminUser) {
			adminUser = await User.create({
				email: 'robinoosterik03@gmail.com',
				username: 'admin',
				firstName: 'admin',
				lastName: 'admin',
				password: 'admin',
				role: adminRole._id,
			});
			console.log('Admin user created');
		} else {
			console.log('Admin user already exists');
			if (!adminUser.role) {
				adminUser.role = adminRole._id;
				await adminUser.save();
				console.log('Admin role assigned to existing admin user');
			}
		}

		console.log('Startup complete');
		process.exit(0);
	} catch (err) {
		console.error('Startup error:', err);
		process.exit(1);
	}
}

init();
