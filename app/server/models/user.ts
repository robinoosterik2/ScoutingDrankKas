import mongoose, { Schema, model } from 'mongoose';
import { Log } from './log';

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
		type: mongoose.Types.Decimal128,
		default: 0.00,
		required: true,
		set: (value: any) => {
			if (typeof value !== 'string') {
				value = value.toString();
			}
			// Replace commas if needed (European notation)
			value = value.replace(',', '.');

			return mongoose.Types.Decimal128.fromString(value);
		},
		get: (value: any) => {
			return value.toString(); // value is already stored accurately
		},
	},
	role: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CustomRole' // Reference to the Role model
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date
}, {
	timestamps: true,
	toJSON: { getters: true },
	toObject: { getters: true }
});

// Method to log user actions
UserSchema.methods.logAction = async function (action: any, description: any) {
	const log = new Log({
		executor: this._id,
		action: action,
		objectType: "User",
		objectId: this._id,
		newValue: JSON.stringify(this),
		description: description
	});
	await log.save();
};

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

			const log = new Log({
				executor: this._id,
				action: "Create",
				objectType: "User",
				objectId: this._id,
				newValue: JSON.stringify(this),
				description: "User created"
			});
			await log.save();
			next();
		} catch (error) {
			console.error('Error hashing password:', error);
			next();
		}
	} else {
		next();
	}
});

// Method to log login action
UserSchema.methods.logLogin = async function () {
	await this.logAction('Login', 'User logged in');
};

UserSchema.methods.raise = function (amount: number) {
    // Convert current balance string (e.g., "10.50") to cents
    // Replace comma with dot for locale consistency before parsing
    const currentBalanceInCents = Math.round(parseFloat(this.balance.replace(',', '.')) * 100);
    
    // Convert raise amount (e.g., 0.20 or "0,20") to cents
    // Ensure amount is treated as a string for consistent comma replacement
    const amountStr = String(amount);
    const raiseAmountInCents = Math.round(parseFloat(amountStr.replace(',', '.')) * 100);
    
    const newBalanceInCents = currentBalanceInCents + raiseAmountInCents;
    
    // Convert back to string representation in the currency format (e.g., "10.70")
    this.balance = (newBalanceInCents / 100).toFixed(2);
    return this.save();
}

export const isAdministrator = async function (userId: string) {
	const user = await User.findById(userId).populate("role");
	if (!user) {
		return false;
	}
	const role = user.role;
	if (!role) {
		return false;
	}
	if (role.rolePermissions.includes('admin')) {
		return true;
	}
	return false;
};

export const isStam = async function (userId: string) {
	const user = await User.findById(userId).populate("role");
	if (!user) {
		return false;
	}
	const role = user.role;
	if (!role) {
		return false;
	}
	if (role.rolePermissions.includes('stam')) {
		return true;
	}
	return false;
};

export const User = mongoose.models.User || mongoose.model("User", UserSchema);


