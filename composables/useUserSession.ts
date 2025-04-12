import { ref, readonly } from 'vue'
import { useNuxtApp } from '#app'

// Create refs outside the function to create a singleton pattern
// This ensures all components use the same session state
const user = ref(null)
const loggedIn = ref(false)
const session = ref({
  isAdmin: false,
  loggedInAt: null
})

export function useUserSession() {
  const nuxtApp = useNuxtApp()

  /**
   * Fetch the current user session data from the server
   */
  const fetch = async () => {
    try {
      const response = await nuxtApp.$fetch('/api/auth/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response?.user) {
        user.value = response.user
        loggedIn.value = true
        session.value = {
          isAdmin: response.user.isAdmin || false,
          loggedInAt: response.user.loggedInAt || new Date()
        }
        return true
      } else {
        await clear()
        return false
      }
    } catch (error) {
      await clear()
      return false
    }
  }

  /**
   * Clear the user session state
   */
  const clear = async () => {
    user.value = null
    loggedIn.value = false
    session.value = {
      isAdmin: false,
      loggedInAt: null
    }
  }

  return {
    user: readonly(user),
    loggedIn: readonly(loggedIn),
    session: readonly(session),
    fetch,
    clear
  }
} 