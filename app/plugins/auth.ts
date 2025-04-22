import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Make useUserSession available for injection
  nuxtApp.provide('userSession', useUserSession)
  
  // Try to fetch the current user session
  const { fetch } = useUserSession()
  
  // Only fetch if not in server-side rendering
  if (process.client) {
    await fetch().catch(() => {
      // Ignore errors during initial load
      console.warn('Failed to load user session during plugin initialization')
    })
  }
}) 