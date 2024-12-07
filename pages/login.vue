<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
        Login
      </h2>
      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div>
          <label for="username">Username:</label>
          <input id="username" v-model="username" name="username" type="text" required
                 class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="Username">
          <div id="errorUsername" class="text-red-500 text-sm mt-1"></div>
        </div>
        <div>
          <label for="password">Password:</label>
          <input id="password" v-model="password" name="password" type="password" required
                 class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="************">
          <div id="errorPassword" class="text-red-500 text-sm mt-1"></div>
        </div>
        <div>
          <button type="submit"
                  class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { fetch } = useUserSession()

const username = ref('')
const password = ref('')


const handleLogin = async () => {
  errorUsername.textContent = ''
  errorPassword.textContent = ''
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    if (data) {
      console.log(data)
      fetch()
      router.push('/')
    }
  } catch (error) {
    console.log(error.statusMessage)
    if (error.statusMessage === 'User not found') {
      document.getElementById('errorUsername').textContent = 'User not found'
    } else if (error.statusMessage === 'Invalid credentials') {
      document.getElementById('errorPassword').textContent = 'Invalid credentials'
    }
  }
}
</script>
