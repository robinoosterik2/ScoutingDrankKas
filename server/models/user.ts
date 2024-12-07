import { Schema, model } from 'mongoose';
import { CustomRole } from './customRole';

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	loggedInAt: {
		type: Date,
		default: Date.now,
	},
	roles: {
		type: [CustomRole.schema],
		ref: CustomRole,
	},
}, {
	timestamps: true
});

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function (next) {
	if (this.isNew) {
		try {
			if (!this.password || this.password.length < 8 || !this.username || !this.email || !this.firstName || !this.lastName) {
				throw new Error('Password, username, email, firstName and lastName are required');
			}
			// all to lowercase
			this.username = this.username.toLowerCase();
			this.email = this.email.toLowerCase();
			this.firstName = this.firstName.toLowerCase();
			this.lastName = this.lastName.toLowerCase();
			this.password = await hashPassword(this.password);
			next();
		} catch (error) {
            console.error('Error hashing password:', error);
            next();
		}
	} else {
		next();
	}
});

// // Example usage
// export const comparePassword = async function (hashedPassword: string, password: string) {
//     return await verifyPassword(hashedPassword, password);
// };

export const User = model("User", UserSchema);

export const isAdministrator = async function (userId: string) {
	const user = await User.findById(userId).populate('roles');
	if (!user) {
		return false;
	}
	const roles = user.roles;
	if (!roles) {
		return false;
	}
	for (const role of roles) {
		if (role.roleName === 'administrator') {
			return true;
		}
	}
	return false;
};