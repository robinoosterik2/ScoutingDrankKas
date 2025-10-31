import { $fetch } from 'ofetch'
import bcrypt from 'bcryptjs'
import { getTestDataFactory, UserData } from './test-data-factory'
import { getTestDatabaseHelper } from './database-helpers'

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface AuthenticatedSession {
  user: {
    id: number
    _id: string
    email: string
    username: string
    firstName: string
    lastName: string
  }
  loggedInAt: number
  isAdmin: boolean
  isStam: boolean
  permissions: {
    admin: boolean
    stam: boolean
  }
  sessionCookie?: string
}

export interface TestUser {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  plainPassword: string
  balance: number
  role?: {
    id: number
    roleName: string
    rolePermissions: string
  }
  permissions: {
    admin: boolean
    stam: boolean
  }
}

export interface AuthTestHelper {
  createTestUser(userData?: Partial<UserData>): Promise<TestUser>
  loginUser(credentials: LoginCredentials): Promise<AuthenticatedSession>
  createAdminUser(): Promise<TestUser>
  createStamUser(): Promise<TestUser>
  getAuthHeaders(session: AuthenticatedSession): Record<string, string>
  clearUserSession(session: AuthenticatedSession): Promise<void>
  createUserWithRole(roleName: string, permissions: Record<string, boolean>): Promise<TestUser>
}

class AuthTestHelperImpl implements AuthTestHelper {
  private baseUrl: string
  private factory = getTestDataFactory()
  private dbHelper = getTestDatabaseHelper()

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async createTestUser(userData: Partial<UserData> = {}): Promise<TestUser> {
    const plainPassword = 'password123'
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    
    const user = this.factory.createUser({
      password: hashedPassword,
      ...userData
    })

    const prisma = this.dbHelper.getTestPrismaClient()
    
    // Create user in database
    const createdUser = await prisma.user.create({
      data: user,
      include: {
        role: true
      }
    })

    return {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      password: hashedPassword,
      plainPassword,
      balance: createdUser.balance,
      role: createdUser.role ? {
        id: createdUser.role.id,
        roleName: createdUser.role.roleName,
        rolePermissions: createdUser.role.rolePermissions || '{}'
      } : undefined,
      permissions: {
        admin: false,
        stam: false
      }
    }
  }

  async loginUser(credentials: LoginCredentials): Promise<AuthenticatedSession> {
    try {
      const response = await $fetch<any>('/api/auth/login', {
        method: 'POST',
        baseURL: this.baseUrl,
        body: credentials,
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Extract session cookie from response headers if available
      const sessionCookie = response.headers?.['set-cookie']?.find((cookie: string) => 
        cookie.startsWith('nuxt-session')
      )

      return {
        user: response.user,
        loggedInAt: Date.now(),
        isAdmin: response.user.permissions?.admin || false,
        isStam: response.user.permissions?.stam || false,
        permissions: response.user.permissions || { admin: false, stam: false },
        sessionCookie
      }
    } catch (error) {
      throw new Error(`Login failed: ${error}`)
    }
  }

  async createAdminUser(): Promise<TestUser> {
    // First create admin role if it doesn't exist
    const prisma = this.dbHelper.getTestPrismaClient()
    
    let adminRole = await prisma.customRole.findFirst({
      where: { roleName: 'admin' }
    })

    if (!adminRole) {
      adminRole = await prisma.customRole.create({
        data: {
          roleName: 'admin',
          roleDescription: 'Administrator role with full permissions',
          rolePermissions: JSON.stringify(['admin', 'stam'])
        }
      })
    }

    const adminUser = await this.createTestUser({
      email: 'admin@test.com',
      username: 'admin_user',
      firstName: 'Admin',
      lastName: 'User',
      balance: 10000,
      roleId: adminRole.id
    })

    adminUser.permissions = { admin: true, stam: true }
    adminUser.role = {
      id: adminRole.id,
      roleName: adminRole.roleName,
      rolePermissions: adminRole.rolePermissions || '{}'
    }

    return adminUser
  }

  async createStamUser(): Promise<TestUser> {
    // First create stam role if it doesn't exist
    const prisma = this.dbHelper.getTestPrismaClient()
    
    let stamRole = await prisma.customRole.findFirst({
      where: { roleName: 'stam' }
    })

    if (!stamRole) {
      stamRole = await prisma.customRole.create({
        data: {
          roleName: 'stam',
          roleDescription: 'Stam role with limited permissions',
          rolePermissions: JSON.stringify(['stam'])
        }
      })
    }

    const stamUser = await this.createTestUser({
      email: 'stam@test.com',
      username: 'stam_user',
      firstName: 'Stam',
      lastName: 'User',
      balance: 5000,
      roleId: stamRole.id
    })

    stamUser.permissions = { admin: false, stam: true }
    stamUser.role = {
      id: stamRole.id,
      roleName: stamRole.roleName,
      rolePermissions: stamRole.rolePermissions || '{}'
    }

    return stamUser
  }

  getAuthHeaders(session: AuthenticatedSession): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (session.sessionCookie) {
      headers['Cookie'] = session.sessionCookie
    }

    return headers
  }

  async clearUserSession(session: AuthenticatedSession): Promise<void> {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        baseURL: this.baseUrl,
        headers: this.getAuthHeaders(session)
      })
    } catch (error) {
      // Logout might fail if session is already invalid, which is fine
      console.warn('Logout failed:', error)
    }
  }

  async createUserWithRole(roleName: string, permissions: Record<string, boolean>): Promise<TestUser> {
    const prisma = this.dbHelper.getTestPrismaClient()
    
    // Create or find role
    let role = await prisma.customRole.findFirst({
      where: { roleName }
    })

    if (!role) {
      const permissionArray = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)

      role = await prisma.customRole.create({
        data: {
          roleName,
          roleDescription: `${roleName} role`,
          rolePermissions: JSON.stringify(permissionArray)
        }
      })
    }

    const user = await this.createTestUser({
      roleId: role.id
    })

    user.permissions = permissions
    user.role = {
      id: role.id,
      roleName: role.roleName,
      rolePermissions: role.rolePermissions || '{}'
    }

    return user
  }
}

// Singleton instance
let authTestHelper: AuthTestHelperImpl | null = null

export function getAuthTestHelper(baseUrl?: string): AuthTestHelper {
  if (!authTestHelper) {
    authTestHelper = new AuthTestHelperImpl(baseUrl)
  }
  return authTestHelper
}

// Utility functions for common test scenarios
export async function createAuthenticatedUser(userData?: Partial<UserData>): Promise<{ user: TestUser; session: AuthenticatedSession }> {
  const helper = getAuthTestHelper()
  const user = await helper.createTestUser(userData)
  
  const session = await helper.loginUser({
    username: user.username,
    password: user.plainPassword
  })

  return { user, session }
}

export async function createAuthenticatedAdmin(): Promise<{ user: TestUser; session: AuthenticatedSession }> {
  const helper = getAuthTestHelper()
  const user = await helper.createAdminUser()
  
  const session = await helper.loginUser({
    username: user.username,
    password: user.plainPassword
  })

  return { user, session }
}

export async function createAuthenticatedStam(): Promise<{ user: TestUser; session: AuthenticatedSession }> {
  const helper = getAuthTestHelper()
  const user = await helper.createStamUser()
  
  const session = await helper.loginUser({
    username: user.username,
    password: user.plainPassword
  })

  return { user, session }
}

// Mock authentication for unit tests (bypasses actual HTTP calls)
export class MockAuthHelper implements AuthTestHelper {
  private factory = getTestDataFactory()
  private dbHelper = getTestDatabaseHelper()

  async createTestUser(userData: Partial<UserData> = {}): Promise<TestUser> {
    const plainPassword = 'password123'
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    
    const user = this.factory.createUser({
      password: hashedPassword,
      ...userData
    })

    const prisma = this.dbHelper.getTestPrismaClient()
    
    const createdUser = await prisma.user.create({
      data: user,
      include: { role: true }
    })

    return {
      id: createdUser.id,
      email: createdUser.email,
      username: createdUser.username,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      password: hashedPassword,
      plainPassword,
      balance: createdUser.balance,
      role: createdUser.role ? {
        id: createdUser.role.id,
        roleName: createdUser.role.roleName,
        rolePermissions: createdUser.role.rolePermissions || '{}'
      } : undefined,
      permissions: {
        admin: false,
        stam: false
      }
    }
  }

  async loginUser(credentials: LoginCredentials): Promise<AuthenticatedSession> {
    // Mock login - just return a session object
    const prisma = this.dbHelper.getTestPrismaClient()
    const user = await prisma.user.findFirst({
      where: { username: credentials.username },
      include: { role: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isAdmin = user.role?.rolePermissions?.includes('admin') || false
    const isStam = user.role?.rolePermissions?.includes('stam') || false

    return {
      user: {
        id: user.id,
        _id: String(user.id),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      loggedInAt: Date.now(),
      isAdmin,
      isStam,
      permissions: { admin: isAdmin, stam: isStam }
    }
  }

  async createAdminUser(): Promise<TestUser> {
    return this.createUserWithRole('admin', { admin: true, stam: true })
  }

  async createStamUser(): Promise<TestUser> {
    return this.createUserWithRole('stam', { admin: false, stam: true })
  }

  getAuthHeaders(session: AuthenticatedSession): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-test-user-id': String(session.user.id)
    }
  }

  async clearUserSession(session: AuthenticatedSession): Promise<void> {
    // Mock - no actual session to clear
  }

  async createUserWithRole(roleName: string, permissions: Record<string, boolean>): Promise<TestUser> {
    const prisma = this.dbHelper.getTestPrismaClient()
    
    let role = await prisma.customRole.findFirst({
      where: { roleName }
    })

    if (!role) {
      const permissionArray = Object.entries(permissions)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)

      role = await prisma.customRole.create({
        data: {
          roleName,
          roleDescription: `${roleName} role`,
          rolePermissions: JSON.stringify(permissionArray)
        }
      })
    }

    const user = await this.createTestUser({
      roleId: role.id
    })

    user.permissions = permissions
    user.role = {
      id: role.id,
      roleName: role.roleName,
      rolePermissions: role.rolePermissions || '{}'
    }

    return user
  }
}