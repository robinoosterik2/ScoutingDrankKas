// Test utilities index - centralized exports for easy importing

// Database utilities
export {
  getTestDatabaseHelper,
  setupTestDatabase,
  teardownTestDatabase,
  type DatabaseTestHelper
} from './database-helpers'

// Authentication utilities
export {
  getAuthTestHelper,
  createAuthenticatedUser,
  createAuthenticatedAdmin,
  createAuthenticatedStam,
  MockAuthHelper,
  type AuthTestHelper,
  type LoginCredentials,
  type AuthenticatedSession,
  type TestUser
} from './auth-helpers'

// Test data factory
export {
  getTestDataFactory,
  TEST_FIXTURES,
  type TestDataFactory,
  type UserData,
  type ProductData,
  type CategoryData,
  type OrderData,
  type OrderItemData,
  type RoleData,
  type RaiseData,
  type SettingsData
} from './test-data-factory'

// Common test patterns and utilities
export const TEST_CONSTANTS = {
  DEFAULT_PASSWORD: 'password123',
  DEFAULT_BALANCE: 5000,
  ADMIN_BALANCE: 10000,
  TEST_TIMEOUT: 30000
}

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Helper function to generate unique test identifiers
export const generateTestId = () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Common assertion helpers
export const assertValidUser = (user: any) => {
  expect(user).toBeDefined()
  expect(user.id).toBeDefined()
  expect(user.email).toBeDefined()
  expect(user.username).toBeDefined()
  expect(user.firstName).toBeDefined()
  expect(user.lastName).toBeDefined()
}

export const assertValidProduct = (product: any) => {
  expect(product).toBeDefined()
  expect(product.id).toBeDefined()
  expect(product.name).toBeDefined()
  expect(product.price).toBeDefined()
  expect(typeof product.price).toBe('number')
}

export const assertValidOrder = (order: any) => {
  expect(order).toBeDefined()
  expect(order.id).toBeDefined()
  expect(order.userId).toBeDefined()
  expect(order.total).toBeDefined()
  expect(typeof order.total).toBe('number')
  expect(order.dayOfOrder).toBeDefined()
}

export const assertErrorResponse = (error: any, expectedStatus: number, expectedMessage?: string) => {
  expect(error).toBeDefined()
  expect(error.statusCode || error.status).toBe(expectedStatus)
  if (expectedMessage) {
    expect(error.message || error.statusMessage).toContain(expectedMessage)
  }
}