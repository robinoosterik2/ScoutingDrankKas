// This file will contain helper functions for user operations.
import bcrypt from 'bcryptjs';
import { UserDocument } from '../models/user';

/**
 * Hashes a given password using bcrypt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} A promise that resolves with the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Logs the creation of a new user to the console.
 * This is a simple logging utility for demonstration or basic tracking.
 * @param {UserDocument} user - The user document of the newly created user.
 */
export function logNewUser(user: UserDocument): void {
  console.log(`New user created: ${user.email}`);
}
