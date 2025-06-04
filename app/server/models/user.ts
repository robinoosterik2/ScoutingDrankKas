import mongoose, { Schema, model, Model } from 'mongoose'; // Import Model
import { Log } from './log';
import { hashPassword, logNewUser } from '../utils/userHelpers'; // Import helper functions

// --- Start of Interface Definitions ---

/**
 * Represents a role object when populated, including its permissions.
 */
export interface PopulatedRole {
  _id: mongoose.Types.ObjectId;
  roleName: string;
  rolePermissions: string[];
  // include other role properties if needed
}

/**
 * Base interface for user properties, shared across different User-related types.
 * Contains all schema fields except Mongoose document methods and virtuals.
 */
interface UserBase {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional because it's not always present (e.g., after fetching)
  loggedInAt: Date;
  active: boolean;
  balance: mongoose.Types.Decimal128; // Internally stored as Decimal128
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date; // from timestamps
  updatedAt: Date; // from timestamps
}

/**
 * Interface representing a User document in MongoDB, including Mongoose document properties and methods.
 * This is the primary type for User model instances.
 */
export interface UserDocument extends UserBase, mongoose.Document {
  _id: mongoose.Types.ObjectId; // Strong type for Mongoose Document _id
  role: mongoose.Types.ObjectId | PopulatedRole; // User's role, can be an ObjectId or a populated PopulatedRole object.

  // Methods
  logAction: (action: string, description: string) => Promise<void>;

  // Methods
  logAction: (action: string, description: string) => Promise<void>;
  logLogin: () => Promise<void>;
  raise: (amount: number) => Promise<UserDocument>;
}

/**
 * Interface for a user object that may have its 'role' field populated.
 * Useful for functions that operate on user data which might come directly from DB query
 * with populated fields or as plain objects. It extends UserBase, so it has all user fields.
 */
export interface UserWithRole extends UserBase {
  role?: PopulatedRole | mongoose.Types.ObjectId; // Role can be populated, an ObjectId, or undefined.
}


// --- End of Interface Definitions ---

const UserSchema = new Schema<UserDocument>({ // Add UserDocument type to Schema
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  loggedInAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
  balance: {
    type: mongoose.Types.Decimal128,
    default: mongoose.Types.Decimal128.fromString("0.00"), // Use Decimal128 for default
    required: true,
    set: (value: string | number | mongoose.Types.Decimal128): mongoose.Types.Decimal128 => {
      let strValue = String(value);
      strValue = strValue.replace(',', '.'); // European notation
      return mongoose.Types.Decimal128.fromString(strValue);
    },
    get: (value: mongoose.Types.Decimal128): string => { // Input is Decimal128
      return value.toString();
    },
  },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomRole' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true,
  toJSON: { getters: true },    // Ensures getters are applied when converting to JSON
  toObject: { getters: true }  // Ensures getters are applied when converting to Object
});

/**
 * Logs an action performed by or on the user.
 * @param {UserDocument} this - The user document instance.
 * @param {string} action - The type of action performed (e.g., "Login", "Update Profile").
 * @param {string} description - A detailed description of the action.
 * @returns {Promise<void>} A promise that resolves when the log is saved.
 */
UserSchema.methods.logAction = async function (this: UserDocument, action: string, description: string): Promise<void> {
	const log = new Log({
		executor: this._id,
		action: action,
		objectType: "User",
		objectId: this._id, // 'this' is UserDocument
		newValue: JSON.stringify(this), // 'this' is UserDocument
		description: description
	});
	await log.save();
};

/**
 * Mongoose pre-save hook for the User schema.
 * Handles password hashing for new users and when the password is modified.
 * Also logs the creation of a new user.
 * @param {UserDocument} this - The user document being saved.
 * @param {function(Error=): void} next - Callback to proceed with saving or pass an error.
 */
UserSchema.pre('save', async function (this: UserDocument, next: (err?: Error) => void) {
	if (this.isNew) {
		try {
			// Ensure password exists before hashing, as it's optional in UserDocument for other contexts
			if (!this.password || this.password.length < 8 || !this.username || !this.email || !this.firstName || !this.lastName) {
				return next(new Error('Password (min 8 chars), username, email, firstName and lastName are required for new user'));
			}
			// all to lowercase
			this.username = this.username.toLowerCase();
			this.email = this.email.toLowerCase();
			this.firstName = this.firstName.toLowerCase();
			this.lastName = this.lastName.toLowerCase();

			this.password = await hashPassword(this.password);

			logNewUser(this); // 'this' is UserDocument, compatible with logNewUser's UserDocument param
			next();
		} catch (error: any) { // Catch block error type
			console.error('Error in pre-save hook for new user:', error);
			next(error);
		}
	} else if (this.isModified('password')) {
		try {
			// Ensure password exists if it's being modified (it should, if schema requires it)
			if (!this.password) {
				return next(new Error('Password cannot be empty when modified.'));
			}
			this.password = await hashPassword(this.password);
			next();
		} catch (error: any) {
			console.error('Error in pre-save hook for password modification:', error);
			next(error);
		}
	} else {
		next();
	}
});

/**
 * Logs a login action for the user.
 * This is a convenience method that calls `logAction`.
 * @param {UserDocument} this - The user document instance.
 * @returns {Promise<void>} A promise that resolves when the login action is logged.
 */
UserSchema.methods.logLogin = async function (this: UserDocument): Promise<void> {
	await this.logAction('Login', 'User logged in');
};

/**
 * Increases the user's balance by a specified amount.
 * Note: This method currently handles positive amounts for increasing balance.
 * It saves the user document after updating the balance.
 * @param {UserDocument} this - The user document instance.
 * @param {number} amount - The amount to add to the user's balance.
 * @returns {Promise<UserDocument>} A promise that resolves with the updated user document.
 * @throws {Error} If the current balance or amount is invalid for calculation.
 */
UserSchema.methods.raise = function (this: UserDocument, amount: number): Promise<UserDocument> {
    // Convert current balance from Decimal128 to a number for calculation
    // this.balance is already a string due to the getter, or Decimal128 if accessed directly.
    // Mongoose getters/setters can be tricky with `this` context.
    // Assuming 'this.balance' inside a method gives the getter's output if toJSON/toObject is not involved.
    // However, for internal logic, it's safer to assume it might be the raw Decimal128 type.
    // Let's ensure we handle Decimal128 directly if possible, or be explicit about toString().
    
    let currentBalanceValue: number;
    if (this.balance instanceof mongoose.Types.Decimal128) {
      currentBalanceValue = parseFloat(this.balance.toString());
    } else {
      // If it's already a string (due to a previous getter or direct set of string)
      currentBalanceValue = parseFloat(String(this.balance).replace(',', '.'));
    }

    // Ensure amount is a number
    const raiseAmount = Number(amount);

    if (isNaN(currentBalanceValue) || isNaN(raiseAmount)) {
        throw new Error('Invalid balance or amount for raise operation');
    }

    const newBalance = currentBalanceValue + raiseAmount;

    // Ensure amount is a number
    const raiseAmount = Number(amount);

    if (isNaN(currentBalance) || isNaN(raiseAmount)) {
        throw new Error('Invalid balance or amount for raise operation');
    }

    const newBalance = currentBalance + raiseAmount;

    // Convert back to Decimal128 before saving
    this.balance = mongoose.Types.Decimal128.fromString(newBalance.toFixed(2)) as UserDocument['balance']; // Ensure type compatibility
    return this.save();
}

/**
 * Checks if a user has administrator privileges.
 * The user's role must be populated for this check to be accurate.
 * @param {UserWithRole | UserDocument} user - The user object or document. Must have a `role` property that is populated (object with `rolePermissions`).
 * @returns {boolean} True if the user is an administrator, false otherwise.
 */
export const isAdministrator = function (user: UserWithRole | UserDocument): boolean {
	if (!user || !user.role) {
		return false;
	}
    // Check if role is populated and has rolePermissions
    if (typeof user.role === 'string' || !('rolePermissions' in user.role) || !Array.isArray(user.role.rolePermissions)) {
        console.warn("isAdministrator called with unpopulated, invalid, or non-array rolePermissions for user:", user.email);
        return false;
    }
	return user.role.rolePermissions.includes('admin');
};

/**
 * Checks if a user has 'stam' privileges (standard user/member, assuming 'stam' is a defined permission).
 * The user's role must be populated for this check to be accurate.
 * @param {UserWithRole | UserDocument} user - The user object or document. Must have a `role` property that is populated (object with `rolePermissions`).
 * @returns {boolean} True if the user has 'stam' permission, false otherwise.
 */
export const isStam = function (user: UserWithRole | UserDocument): boolean {
	if (!user || !user.role) {
		return false;
	}
    // Check if role is populated and has rolePermissions
    if (typeof user.role === 'string' || !('rolePermissions' in user.role) || !Array.isArray(user.role.rolePermissions)) {
        console.warn("isStam called with unpopulated, invalid, or non-array rolePermissions for user:", user.email);
        return false;
    }
	return user.role.rolePermissions.includes('stam');
};

export const User: Model<UserDocument> = mongoose.models.User || model<UserDocument>("User", UserSchema);

// Export UserDocument if it's the main document type
// Ensure UserWithRole aligns with UserDocument's role type for consistency
interface PopulatedRole { // Helper type for populated role object
    _id: mongoose.Types.ObjectId;
    roleName: string;
    rolePermissions: string[];
}
export interface UserDocument extends mongoose.Document {
    _id: mongoose.Types.ObjectId; // Explicitly add _id
	email: string;
	username: string;
	firstName: string;
	lastName: string;
	password?: string;
	loggedInAt: Date;
	active: boolean;
	balance: mongoose.Types.Decimal128; // Stored as Decimal128
	role: mongoose.Types.ObjectId | PopulatedRole; // Can be ObjectId or populated object
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
	createdAt: Date;
	updatedAt: Date;

	// Methods
	logAction: (action: string, description: string) => Promise<void>;
	logLogin: () => Promise<void>;
	raise: (amount: number) => Promise<UserDocument>;

    // Virtuals or other properties from UserWithRole if they are not direct fields
    // This makes UserDocument the single source of truth for a user instance's type.
}

// Update balance setter and getter types
const UserSchemaDefinition = {
    email: { type: String, required: true, unique: true },
    // ... (other fields from UserSchema) ...
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    loggedInAt: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
    balance: {
        type: mongoose.Types.Decimal128,
        default: 0.00,
        required: true,
        set: (value: string | number | mongoose.Types.Decimal128): mongoose.Types.Decimal128 => {
            let strValue = String(value);
            // Replace commas if needed (European notation)
            strValue = strValue.replace(',', '.');
            return mongoose.Types.Decimal128.fromString(strValue);
        },
        get: (value: mongoose.Types.Decimal128): string => {
            return value.toString();
        },
    },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomRole' },
    resetPasswordToken: String,
    resetPasswordExpires: Date
};

// Re-apply UserSchema with typed definition for clarity if desired, or just update methods/virtuals on existing UserSchema
// For this refactor, I'll focus on method signatures and UserDocument interface primarily.
// The original UserSchema definition is fine, just ensure methods and UserDocument interface are strongly typed.


