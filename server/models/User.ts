import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function (next) {
	if (this.isNew) {
		try {
			const hashedPassword = await hashPassword(this.password);
			this.password = hashedPassword;
			next();
		} catch (error) {
            console.error('Error hashing password:', error);
			next();
		}
	} else {
		next();
	}
});

export const User = model("User", UserSchema);
