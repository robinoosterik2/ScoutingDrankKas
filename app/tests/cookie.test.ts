import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { faker } from '@faker-js/faker'
import { User } from '../server/models/user' // Assuming path to user model

describe('User Session and Cookie Management', () => {
	let testUser: any
	let userCredentials: any

	beforeEach(async () => {
		// Generate unique user credentials for each test
		userCredentials = {
			username: faker.internet.userName().toLowerCase() + faker.string.alphanumeric(5),
			email: faker.internet.email().toLowerCase(),
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			password: 'Password123!',
			confirmPassword: 'Password123!',
			age: faker.number.int({ min: 18, max: 99 }),
		}

		// Register the user
		await $fetch('/api/auth/register', {
			method: 'POST',
			body: userCredentials,
		})

		// Login the user - $fetch will store the cookie for subsequent requests in this scope
		const loginResponse = await $fetch('/api/auth/login', {
			method: 'POST',
			body: {
				username: userCredentials.username,
				password: userCredentials.password,
			},
		})
		testUser = loginResponse.user
	})

	afterEach(async () => {
		// Clean up the created user
		if (testUser && testUser._id) {
			await User.findByIdAndDelete(testUser._id)
		} else if (userCredentials && userCredentials.username) {
            // Fallback if testUser._id wasn't populated for some reason
            await User.deleteOne({ username: userCredentials.username });
        }
		testUser = null
		userCredentials = null
	})

	it('should allow access to a protected route when logged in', async () => {
		const response = await $fetch('/api/auth/auth', { method: 'GET' })
		expect(response).toBeDefined()
		expect(response.user).toBeDefined()
		expect(response.user._id).toBe(testUser._id)
		expect(response.user.username).toBe(testUser.username)
	})

	it('should deny access to a protected route when not logged in', async () => {
		// $fetch instance here is fresh and does not have prior session cookies
		// To be absolutely sure, we'd ideally use a new $fetch context or clear cookies,
		// but typically test utils scope cookies per test or require manual carry-over.
		// For this test, we will try to logout first to ensure session is clear.
		await $fetch('/api/auth/logout', { method: 'POST' })

		try {
			await $fetch('/api/auth/auth', { method: 'GET' })
			// Should not reach here
			expect(true).toBe(false)
		} catch (error: any) {
			expect(error.statusCode).toBe(401)
			// The auth.get.ts throws: { statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required" }
			// error.data should contain this
			expect(error.data.statusMessage).toBe('Unauthorized')
            expect(error.data.message).toBe('Authentication required')
		}
	})

    it('should clear session on logout and deny access to protected route', async () => {
        // User is logged in via beforeEach

        // Verify access before logout
        const authCheckBeforeLogout = await $fetch('/api/auth/auth', { method: 'GET' });
        expect(authCheckBeforeLogout.user._id).toBe(testUser._id);

        // Call logout
        // The logout endpoint redirects. $fetch follows redirects by default and the final response might not be what we want to check directly for cookie clearing.
        // The important part is that the session is invalidated on the server.
        const logoutResponse = await $fetch('/api/auth/logout', {
            method: 'POST',
            // Prevent $fetch from throwing on 302, not strictly necessary for this test's logic but good to know
            // validStatusCodes: [200, 302]
        });

        // If logout redirects, the response here might be the HTML of the login page.
        // We can check for the redirect status if we configure $fetch not to follow redirects,
        // or inspect headers if possible. Nuxt Test Utils $fetch might not easily expose this.
        // For now, we rely on the functional outcome: inability to access protected routes.
        // expect(logoutResponse.status) or headers related to cookie clearing would be ideal.
        // Example: expect(logoutResponse.headers.get('set-cookie')).toContain('Max-Age=0');

        // Attempt to access protected route after logout
        try {
            await $fetch('/api/auth/auth', { method: 'GET' })
            // Should not reach here
            expect(true).toBe(false)
        } catch (error: any) {
            expect(error.statusCode).toBe(401)
            expect(error.data.statusMessage).toBe('Unauthorized')
            expect(error.data.message).toBe('Authentication required')
        }
    })

    it('initial request to protected route without session should fail', async () => {
        // This test needs a truly fresh $fetch instance, not one from beforeEach
        // This is tricky because beforeEach already logs in.
        // For a true "initial request" test, this should be in a separate describe block
        // or be the first test without a beforeEach login.
        // Given the current structure, this test is somewhat redundant with
        // 'should deny access to a protected route when not logged in' after logout.
        // However, we can simulate it by logging out first.

        await $fetch('/api/auth/logout', { method: 'POST' }); // Ensure no session from beforeEach

        try {
            await $fetch('/api/auth/auth', { method: 'GET' });
            expect.fail("Accessing protected route without session should have failed.");
        } catch (error: any) {
            expect(error.statusCode).toBe(401);
            expect(error.data.statusMessage).toBe('Unauthorized');
            expect(error.data.message).toBe('Authentication required');
        }
    });
})
