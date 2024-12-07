// Define the User interface based on the Mongoose schema
export interface UserState {
  _id?: string
  email: string
  username: string
  firstName: string
  lastName: string
  loggedInAt?: Date | string
  roles?: any[] // Adjust the type based on your CustomRole schema
}

interface StoreState {
  user: UserState | null
  isAuthenticated: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): StoreState => ({
    user: null,
    isAuthenticated: false,
    error: null
  }),

  actions: {
    // Register a new user
    async register(userData: Omit<UserState, '_id'> & { password: string }) {
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: userData
        })

        // Update store state after successful registration
        this.user = response.user
        this.isAuthenticated = true
        this.error = null

        return response
      } catch (error: any) {
        this.error = error.message || 'Registration failed'
        this.isAuthenticated = false
        throw error
      }
    },

    // Login user
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        })

        // Update store state after successful login
        this.user = response.user
        this.isAuthenticated = true
        this.error = null

        return response
      } catch (error: any) {
        this.error = error.message || 'Login failed'
        this.isAuthenticated = false
        throw error
      }
    },

    // Logout user
    async logout() {
      try {
        await $fetch('/api/auth/logout', {
          method: 'POST'
        })

        // Reset store state
        this.user = null
        this.isAuthenticated = false
        this.error = null
        this.removeToken()
      } catch (error: any) {
        this.error = error.message || 'Logout failed'
        throw error
      }
    },

    // Set authentication token
    setToken(token: string) {
      localStorage.setItem('authToken', token)
    },

    // Remove authentication token
    removeToken() {
      localStorage.removeItem('authToken')
    }
  },

  getters: {
    // Get current user's full name
    fullName(): string {
      return this.user 
        ? `${this.user.firstName} ${this.user.lastName}` 
        : ''
    },

    // Check if user is logged in
    isLoggedIn(): boolean {
      return !!this.user
    },

    getUser() {
      return this.user
    }
  }
})