import { faker } from '@faker-js/faker'
import { PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

export interface UserData {
  id?: number
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  loggedInAt?: Date
  active?: boolean
  balance?: number
  resetPasswordToken?: string | null
  resetPasswordExpires?: Date | null
  roleId?: number | null
  settingsId?: number | null
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductData {
  id?: number
  name: string
  description: string
  price: number
  ageRestriction?: boolean
  stock?: number
  packSize?: number | null
  imageUrl?: string
  totalOrders?: number
  totalQuantitySold?: number
  recentOrders?: string | null
  popularityScore?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryData {
  id?: number
  name: string
  ageRestriction: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderData {
  id?: number
  userId: number
  bartenderId?: number | null
  total: number
  dayOfOrder: Date
  items?: OrderItemData[]
  createdAt?: Date
  updatedAt?: Date
}

export interface OrderItemData {
  orderId?: number
  productId: number
  count: number
}

export interface RoleData {
  id?: number
  roleName: string
  roleDescription: string
  rolePermissions?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface RaiseData {
  id?: number
  userId: number
  raiserId?: number | null
  amount: number
  paymentMethod?: PaymentMethod
  dayOfOrder: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface SettingsData {
  id?: number
  language?: string
  darkMode?: boolean
  speedMode?: boolean
}

export interface TestDataFactory {
  createUser(overrides?: Partial<UserData>): UserData
  createProduct(overrides?: Partial<ProductData>): ProductData
  createCategory(overrides?: Partial<CategoryData>): CategoryData
  createOrder(overrides?: Partial<OrderData>): OrderData
  createOrderItem(overrides?: Partial<OrderItemData>): OrderItemData
  createRole(overrides?: Partial<RoleData>): RoleData
  createRaise(overrides?: Partial<RaiseData>): RaiseData
  createSettings(overrides?: Partial<SettingsData>): SettingsData
  createAdminUser(overrides?: Partial<UserData>): UserData
  createStamUser(overrides?: Partial<UserData>): UserData
  createUserWithRole(roleId: number, overrides?: Partial<UserData>): UserData
}

class TestDataFactoryImpl implements TestDataFactory {
  private userCounter = 1
  private productCounter = 1
  private categoryCounter = 1
  private orderCounter = 1
  private roleCounter = 1
  private raiseCounter = 1
  private settingsCounter = 1

  createUser(overrides: Partial<UserData> = {}): UserData {
    const baseUser: UserData = {
      email: overrides.email || faker.internet.email(),
      username: overrides.username || `user${this.userCounter++}_${faker.internet.username()}`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: bcrypt.hashSync('password123', 10), // Default test password
      loggedInAt: new Date(),
      active: true,
      balance: faker.number.int({ min: 0, max: 10000 }), // Balance in cents
      resetPasswordToken: null,
      resetPasswordExpires: null,
      roleId: null,
      settingsId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseUser, ...overrides }
  }

  createProduct(overrides: Partial<ProductData> = {}): ProductData {
    const baseProduct: ProductData = {
      name: overrides.name || `${faker.commerce.productName()}_${this.productCounter++}`,
      description: faker.commerce.productDescription(),
      price: faker.number.int({ min: 50, max: 1000 }), // Price in cents
      ageRestriction: faker.datatype.boolean(),
      stock: faker.number.int({ min: 0, max: 100 }),
      packSize: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 24 }), { probability: 0.3 }),
      imageUrl: '/images/placeholder.jpg',
      totalOrders: faker.number.int({ min: 0, max: 1000 }),
      totalQuantitySold: faker.number.int({ min: 0, max: 5000 }),
      recentOrders: null,
      popularityScore: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseProduct, ...overrides }
  }

  createCategory(overrides: Partial<CategoryData> = {}): CategoryData {
    const baseCategory: CategoryData = {
      name: overrides.name || `${faker.commerce.department()}_${this.categoryCounter++}`,
      ageRestriction: faker.datatype.boolean(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseCategory, ...overrides }
  }

  createOrder(overrides: Partial<OrderData> = {}): OrderData {
    const baseOrder: OrderData = {
      userId: overrides.userId || 1, // Must be provided or defaulted
      bartenderId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), { probability: 0.7 }),
      total: faker.number.int({ min: 100, max: 5000 }), // Total in cents
      dayOfOrder: faker.date.recent({ days: 30 }),
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseOrder, ...overrides }
  }

  createOrderItem(overrides: Partial<OrderItemData> = {}): OrderItemData {
    const baseOrderItem: OrderItemData = {
      productId: overrides.productId || 1, // Must be provided or defaulted
      count: faker.number.int({ min: 1, max: 10 })
    }

    return { ...baseOrderItem, ...overrides }
  }

  createRole(overrides: Partial<RoleData> = {}): RoleData {
    const baseRole: RoleData = {
      roleName: overrides.roleName || `${faker.person.jobTitle()}_${this.roleCounter++}`,
      roleDescription: faker.person.jobDescriptor(),
      rolePermissions: faker.helpers.maybe(() => JSON.stringify({
        admin: faker.datatype.boolean(),
        stam: faker.datatype.boolean(),
        canManageUsers: faker.datatype.boolean(),
        canManageProducts: faker.datatype.boolean()
      }), { probability: 0.8 }),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseRole, ...overrides }
  }

  createRaise(overrides: Partial<RaiseData> = {}): RaiseData {
    const baseRaise: RaiseData = {
      userId: overrides.userId || 1, // Must be provided or defaulted
      raiserId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), { probability: 0.8 }),
      amount: faker.number.int({ min: 500, max: 10000 }), // Amount in cents
      paymentMethod: faker.helpers.arrayElement([PaymentMethod.cash, PaymentMethod.pin]),
      dayOfOrder: faker.date.recent({ days: 30 }),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return { ...baseRaise, ...overrides }
  }

  createSettings(overrides: Partial<SettingsData> = {}): SettingsData {
    const baseSettings: SettingsData = {
      language: faker.helpers.arrayElement(['en', 'nl', 'de', 'fr']),
      darkMode: faker.datatype.boolean(),
      speedMode: faker.datatype.boolean()
    }

    return { ...baseSettings, ...overrides }
  }

  createAdminUser(overrides: Partial<UserData> = {}): UserData {
    return this.createUser({
      email: overrides.email || 'admin@test.com',
      username: overrides.username || 'admin_user',
      firstName: 'Admin',
      lastName: 'User',
      balance: 10000, // Admin users get higher balance
      ...overrides
    })
  }

  createStamUser(overrides: Partial<UserData> = {}): UserData {
    return this.createUser({
      email: overrides.email || 'stam@test.com',
      username: overrides.username || 'stam_user',
      firstName: 'Stam',
      lastName: 'User',
      balance: 5000, // Stam users get moderate balance
      ...overrides
    })
  }

  createUserWithRole(roleId: number, overrides: Partial<UserData> = {}): UserData {
    return this.createUser({
      roleId,
      ...overrides
    })
  }
}

// Singleton instance
let testDataFactory: TestDataFactoryImpl | null = null

export function getTestDataFactory(): TestDataFactory {
  if (!testDataFactory) {
    testDataFactory = new TestDataFactoryImpl()
  }
  return testDataFactory
}

// Predefined test fixtures for consistent testing
export const TEST_FIXTURES = {
  adminRole: {
    roleName: 'admin',
    roleDescription: 'Administrator role with full permissions',
    rolePermissions: JSON.stringify({
      admin: true,
      stam: true,
      canManageUsers: true,
      canManageProducts: true,
      canManageOrders: true,
      canManageCategories: true,
      canManageRoles: true
    })
  },
  
  stamRole: {
    roleName: 'stam',
    roleDescription: 'Stam role with limited permissions',
    rolePermissions: JSON.stringify({
      admin: false,
      stam: true,
      canManageUsers: false,
      canManageProducts: false,
      canManageOrders: true,
      canManageCategories: false,
      canManageRoles: false
    })
  },

  defaultSettings: {
    language: 'nl',
    darkMode: true,
    speedMode: false
  },

  testCategories: [
    { name: 'Beverages', ageRestriction: false },
    { name: 'Alcohol', ageRestriction: true },
    { name: 'Snacks', ageRestriction: false },
    { name: 'Meals', ageRestriction: false }
  ],

  testProducts: [
    {
      name: 'Coffee',
      description: 'Fresh brewed coffee',
      price: 150, // €1.50
      ageRestriction: false,
      stock: 50
    },
    {
      name: 'Beer',
      description: 'Cold beer',
      price: 250, // €2.50
      ageRestriction: true,
      stock: 30
    },
    {
      name: 'Sandwich',
      description: 'Fresh sandwich',
      price: 400, // €4.00
      ageRestriction: false,
      stock: 20
    }
  ]
}