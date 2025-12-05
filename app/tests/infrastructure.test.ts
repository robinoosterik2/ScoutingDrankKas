import { describe, it, expect } from 'vitest'
import {
  getTestDatabaseHelper,
  getTestDataFactory,
  getAuthTestHelper,
  TEST_CONSTANTS
} from './utils'

describe('Test Infrastructure', () => {
  it('should initialize database helper', () => {
    const dbHelper = getTestDatabaseHelper()
    expect(dbHelper).toBeDefined()
    
    const prisma = dbHelper.getTestPrismaClient()
    expect(prisma).toBeDefined()
  })

  it('should create test data with factory', () => {
    const factory = getTestDataFactory()
    expect(factory).toBeDefined()

    const user = factory.createUser()
    expect(user.email).toBeDefined()
    expect(user.username).toBeDefined()
    expect(user.password).toBeDefined()

    const product = factory.createProduct()
    expect(product.name).toBeDefined()
    expect(product.price).toBeGreaterThan(0)

    const category = factory.createCategory()
    expect(category.name).toBeDefined()
    expect(typeof category.ageRestriction).toBe('boolean')
  })

  it('should initialize auth helper', () => {
    const authHelper = getAuthTestHelper()
    expect(authHelper).toBeDefined()
  })

  it('should have test constants defined', () => {
    expect(TEST_CONSTANTS.DEFAULT_PASSWORD).toBe('password123')
    expect(TEST_CONSTANTS.DEFAULT_BALANCE).toBe(5000)
    expect(TEST_CONSTANTS.ADMIN_BALANCE).toBe(10000)
  })

  it('should create realistic test data', () => {
    const factory = getTestDataFactory()
    
    // Test multiple users to ensure uniqueness
    const user1 = factory.createUser()
    const user2 = factory.createUser()
    
    expect(user1.username).not.toBe(user2.username)
    expect(user1.email).not.toBe(user2.email)
    
    // Test product data
    const product = factory.createProduct()
    expect(product.price).toBeGreaterThan(0)
    expect(product.stock).toBeGreaterThanOrEqual(0)
    
    // Test order data
    const order = factory.createOrder({ userId: 1 })
    expect(order.userId).toBe(1)
    expect(order.total).toBeGreaterThan(0)
  })

  it('should create admin and stam roles with proper permissions', () => {
    const factory = getTestDataFactory()
    
    const adminRole = factory.createRole({
      roleName: 'admin',
      rolePermissions: JSON.stringify(['admin', 'stam'])
    })
    
    expect(adminRole.roleName).toBe('admin')
    expect(adminRole.rolePermissions).toContain('admin')
    
    const stamRole = factory.createRole({
      roleName: 'stam', 
      rolePermissions: JSON.stringify(['stam'])
    })
    
    expect(stamRole.roleName).toBe('stam')
    expect(stamRole.rolePermissions).toContain('stam')
  })
})