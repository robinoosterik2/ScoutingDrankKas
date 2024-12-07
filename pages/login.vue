<template>
  <div class="flex items-center justify-center">
    <div class="max-w-sm w-full space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
        Login
      </h2>
      <form @submit.prevent="handleLogin" class="space-y-2">
        <div>
          <label class="text-xs" for="username">Username:</label>
          <input id="username" v-model="username" name="username" type="text" required
                 class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="Username">
          <div id="errorUsername" class="text-red-500 text-sm mt-1"></div>
        </div>
        <div>
          <label class="text-xs" for="password">Password:</label>
          <input id="password" v-model="password" name="password" type="password" required
                 class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="************">
          <div id="errorPassword" class="text-red-500 text-sm mt-1"></div>
        </div>
        <div class="pt-4">
          <button type="submit"
                  class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Login
          </button>
        </div>
        <div>
          <div>Don't have an account?
            <NuxtLink to="/register" class="text-sm text-blue-600 hover:text-blue-800">
              Register
            </NuxtLink>
          </div>
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
  document.getElementById('errorUsername').textContent = ''
  document.getElementById('errorPassword').textContent = ''
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    if (data) {
      console.log(data)
      await fetch()
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
