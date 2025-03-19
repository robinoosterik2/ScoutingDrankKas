<template>
  <div class="flex h-max items-center justify-center">
    <div class="max-w-sm w-full space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
        {{ $t('login.title') }}
      </h2>
      <form @submit.prevent="handleLogin" class="space-y-2">
        <div>
          <label for="username">{{ $t('login.username') }}</label>
          <input id="username" v-model="username" name="username" type="text" required
                 class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 :placeholder="$t('login.usernamePlaceholder')">
          <div id="errorUsername" class="text-red-500 mt-1"></div>
        </div>
        <div>
          <label for="password">{{ $t('login.password') }}</label>
          <input id="password" v-model="password" name="password" type="password" required
                 class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                 placeholder="••••••••••">
          <div id="errorPassword" class="text-red-500 mt-1"></div>
        </div>
        <div class="pt-4">
          <button type="submit"
                  class="group relative w-full flex justify-center py-1 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {{ $t('login.submit') }}
          </button>
        </div>
        <div>
          <div>{{ $t('login.noAccount') }}
            <NuxtLink to="/register" class=" text-blue-600 hover:text-blue-800">
              {{ $t('login.register') }}
            </NuxtLink>
          </div>
          <div>{{ $t('login.forgotPassword') }}
            <NuxtLink to="/user/forgot-password" class=" text-blue-600 hover:text-blue-800">
              {{ $t('login.resetHere') }}
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
const { t } = useI18n()

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
      await fetch()
      router.push('/')
    }
  } catch (error) {
    if (error.statusMessage === 'User not found') {
      document.getElementById('errorUsername').textContent = t('login.errors.userNotFound')
    } else if (error.statusMessage === 'Invalid credentials') {
      document.getElementById('errorPassword').textContent = t('login.errors.invalidCredentials')
    }
  }
}
</script>
