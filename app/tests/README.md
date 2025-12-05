# Test Infrastructure

This directory contains the comprehensive test infrastructure for validating API endpoints after the MongoDB to Prisma SQLite migration.

## Overview

The test infrastructure provides:

- **Database Test Utilities**: Isolated SQLite test databases with automatic setup/teardown
- **Authentication Test Helpers**: User creation and session management for tests
- **Test Data Factory**: Realistic test data generation using Faker.js
- **Common Test Utilities**: Assertion helpers and test patterns

## Quick Start

```typescript
import { 
  getTestDatabaseHelper, 
  getAuthTestHelper, 
  getTestDataFactory 
} from './utils'

describe('My API Tests', () => {
  it('should test user creation', async () => {
    const authHelper = getAuthTestHelper()
    const user = await authHelper.createTestUser({
      email: 'test@example.com',
      username: 'testuser'
    })
    
    expect(user.email).toBe('test@example.com')
  })
})
```

## Core Components

### Database Helper

Manages isolated test databases with automatic schema creation and cleanup:

```typescript
const dbHelper = getTestDatabaseHelper()

// Reset database to clean state
await dbHelper.resetDatabase()

// Seed test data
await dbHelper.seedTestData(fixtures)

// Clean up after tests
await dbHelper.cleanupTestData()
```

### Authentication Helper

Creates test users with different roles and manages authentication:

```typescript
const authHelper = getAuthTestHelper()

// Create regular user
const user = await authHelper.createTestUser()

// Create admin user
const admin = await authHelper.createAdminUser()

// Create stam user
const stam = await authHelper.createStamUser()

// Login user and get session
const session = await authHelper.loginUser({
  username: user.username,
  password: user.plainPassword
})

// Get auth headers for requests
const headers = authHelper.getAuthHeaders(session)
```

### Test Data Factory

Generates realistic test data using Faker.js:

```typescript
const factory = getTestDataFactory()

// Create test entities
const user = factory.createUser()
const product = factory.createProduct()
const category = factory.createCategory()
const order = factory.createOrder({ userId: user.id })
const role = factory.createRole()
const raise = factory.createRaise({ userId: user.id })
```

## Test Configuration

The test infrastructure is configured in `vitest.config.ts`:

- **Isolated execution**: Each test runs in isolation
- **Test database**: Separate SQLite database per test run
- **Automatic setup/teardown**: Database reset before each test
- **Extended timeout**: 30 seconds for complex operations

## File Structure

```
tests/
├── utils/
│   ├── auth-helpers.ts          # Authentication test utilities
│   ├── database-helpers.ts      # Database management utilities
│   ├── test-data-factory.ts     # Test data generation
│   ├── setup.ts                 # Global test setup
│   └── index.ts                 # Centralized exports
├── api/                         # API endpoint tests (to be created)
├── infrastructure.test.ts       # Infrastructure validation tests
└── README.md                    # This file
```

## Best Practices

### Test Isolation

Each test should be completely independent:

```typescript
describe('User API', () => {
  beforeEach(async () => {
    // Database is automatically reset
    // Create fresh test data for each test
  })
  
  it('should create user', async () => {
    // Test implementation
  })
})
```

### Authentication Testing

Use the authentication helpers for consistent user management:

```typescript
// For tests requiring authenticated users
const { user, session } = await createAuthenticatedUser()

// For admin-only endpoints
const { user: admin, session: adminSession } = await createAuthenticatedAdmin()

// Make authenticated requests
const response = await $fetch('/api/users/profile', {
  headers: authHelper.getAuthHeaders(session)
})
```

### Error Testing

Test error scenarios comprehensively:

```typescript
it('should handle invalid input', async () => {
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: { invalid: 'data' }
    })
    expect.fail('Should have thrown error')
  } catch (error) {
    assertErrorResponse(error, 400, 'Invalid input')
  }
})
```

### Data Validation

Use assertion helpers for consistent validation:

```typescript
import { assertValidUser, assertValidProduct } from './utils'

it('should return valid user data', async () => {
  const user = await createUser()
  assertValidUser(user)
  
  // Additional specific assertions
  expect(user.email).toContain('@')
})
```

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- --run infrastructure.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

## Environment Variables

The test infrastructure uses these environment variables:

- `DATABASE_URL`: Set automatically to test database path
- `NODE_ENV`: Set to 'test' during test execution

## Troubleshooting

### Database Issues

If you encounter database-related errors:

1. Ensure Prisma schema is up to date: `npx prisma generate`
2. Check that migrations exist: `ls prisma/migrations/`
3. Verify test database permissions

### Authentication Issues

For authentication test failures:

1. Check that user roles are created properly
2. Verify password hashing is consistent
3. Ensure session management is working

### Performance Issues

If tests are slow:

1. Use `MockAuthHelper` for unit tests that don't need real authentication
2. Minimize database operations in test setup
3. Use test data factory efficiently

## Next Steps

This infrastructure is ready for implementing comprehensive API endpoint tests. The recommended approach is:

1. Create test files for each API route group (auth, users, products, etc.)
2. Use the provided utilities for consistent test patterns
3. Follow the test-driven development approach
4. Implement both positive and negative test scenarios
5. Add integration tests for complex workflows

For examples of how to use this infrastructure, see `infrastructure.test.ts`.