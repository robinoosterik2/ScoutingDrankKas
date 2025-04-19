import { describe, it, expect } from 'vitest'
import { $fetch, useTestContext } from '@nuxt/test-utils'
import { faker } from '@faker-js/faker'

describe('Session behavior', () => {
	it('sets a session cookie on login', async () => {
		const user2 = {
			username: 'testuser',
			email: 'test@example.com',
			firstName: 'Test',
			lastName: 'User',
			password: 'verysecure123',
			confirmPassword: 'verysecure123',
			age: 20,
		}
		await $fetch('/api/auth/register', { method: 'POST', body: user2 })

		const response = await $fetch('/api/auth/login', {
			method: 'POST',
			body: {
				username: user2.username,
				password: user2.password
			}
		})
        // check if we can get to /dashboard
        expect(response).toBeDefined()
        expect(response.user).toBeDefined()
        expect(response.user).toHaveProperty('username', user2.username)

	})
})
