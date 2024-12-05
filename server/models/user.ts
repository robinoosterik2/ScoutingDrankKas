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
		type: [Schema.Types.ObjectId],
		ref: CustomRole,
	},
}, {
	timestamps: true
});

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function (next) {
	if (this.isNew) {
		try {
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
