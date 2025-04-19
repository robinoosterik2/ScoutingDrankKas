import { describe, it, expect } from 'vitest'
import { faker } from '@faker-js/faker';
import { $fetch } from '@nuxt/test-utils';


describe('API endpoint: /api/auth/register and /api/auth/login', async () => {
  // Helper function to generate user data
  const generateUserData = () => {
    const firstName = faker.person.firstName().toLowerCase();
    const lastName = faker.person.lastName().toLowerCase();
    const password = faker.internet.password({ length: 10 }); // Ensure length >= 8
    return {
      firstName,
      lastName,
      username: faker.internet.username({ firstName, lastName }),
      email: faker.internet.email({ firstName, lastName }),
      password,
      confirmPassword: password
    };
  };

  it('should create a user successfully', async () => {
    const userData = generateUserData();
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    });
    expect(response.user).toBeDefined();
    expect(response.user).toHaveProperty('username', userData.username);
    expect(response.user).toHaveProperty('email', userData.email);
    expect(response.user).toHaveProperty('firstName', userData.firstName);
    expect(response.user).toHaveProperty('lastName', userData.lastName);
    // Password should not be returned
    expect(response.user).not.toHaveProperty('password');
  });

  it('should allow a registered user to login', async () => {
    const userData = generateUserData();
    // 1. Register the user
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    });

    // 2. Attempt to login
    const loginResponse = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: userData.username,
        password: userData.password
      }
    });

    // Adjust expectations based on your login response structure
    expect(loginResponse).toBeDefined();
    expect(loginResponse.user).toBeDefined();
    expect(loginResponse.user).toHaveProperty('username', userData.username);
  });

  it('should fail to create a user with an existing username', async () => {
    const userData = generateUserData();
    // 1. Create the first user
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    });

    // 2. Attempt to create another user with the same username but different email/password
    const duplicateUserData = {
      ...generateUserData(), // Generate new details
      username: userData.username, // Use the same username
      password: faker.internet.password({ length: 10 }),
    };
    duplicateUserData.confirmPassword = duplicateUserData.password;


    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: duplicateUserData
      });
      // If the request succeeds, the test should fail
      expect.fail('Should have failed to register user with duplicate username');
    } catch (error: any) {
      // Expecting an error response (e.g., 409 Conflict or 400 Bad Request)
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(500);
    }
  });

  it('should fail to create a user with an existing email', async () => {
    const userData = generateUserData();
    // 1. Create the first user
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: userData
    });

    // 2. Attempt to create another user with the same email but different username/password
    const duplicateUserData = {
      ...generateUserData(), // Generate new details
      email: userData.email, // Use the same email
      password: faker.internet.password({ length: 10 }),
    };
    duplicateUserData.confirmPassword = duplicateUserData.password;


    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: duplicateUserData
      });
      // If the request succeeds, the test should fail
      expect.fail('Should have failed to register user with duplicate email');
    } catch (error: any) {
      // Expecting an error response (e.g., 409 Conflict or 400 Bad Request)
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(500);
    }
  });

  it('should fail registration if passwords do not match', async () => {
    const userData = generateUserData();
    userData.confirmPassword = 'differentPassword'; // Mismatch passwords

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      });
      expect.fail('Should have failed due to password mismatch');
    } catch (error: any) {
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(500);
    }
  });

  it('should fail registration if password is too short', async () => {
    const userData = generateUserData();
    userData.password = 'short'; // Password too short
    userData.confirmPassword = 'short';

    try {
      await $fetch('/api/auth/register', {
        method: 'POST',
        body: userData
      });
      expect.fail('Should have failed due to short password');
    } catch (error: any) {
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(500);
      // expect(error.data.message).toContain('Password must be at least');
    }
  });
})