import mongoose, { Schema, model } from 'mongoose';
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
	active: {
		type: Boolean,
		default: true,
	},
	balance: {
		type: Number,
		default: 0,
	},
	role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CustomRole' // Reference to the Role model
    }
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


export const isAdministrator = async function (userId: string) {
	const user = await User.findById(userId).populate("role");
	if (!user) {
		return false;
	}
	const role = user.role;
	if (!role) {
		return false;
	}

	if (role.rolePermissions.includes("admin")) {
		return true;
	}
	return true;
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);


