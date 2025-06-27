<template>
	<div class="flex items-center justify-center h-max">
	  <div class="w-full max-w-sm p-4 space-y-2 bg-white rounded-lg shadow-md dark:bg-gray-800">
		<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
		  {{ $t('resetPassword.title') }}
		</h2>
		<form class="space-y-2" @submit.prevent="handleResetPassword">
		  <div>
			<label for="newPassword">{{ $t('resetPassword.newPassword') }}</label>
			<input
id="newPassword" v-model="newPassword" name="newPassword" type="password" required
				   class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
				   placeholder="••••••••••">
			<div id="errorNewPassword" class="mt-1 text-red-500"/>
		  </div>
		  <div>
			<label for="confirmPassword">{{ $t('resetPassword.confirmPassword') }}</label>
			<input
id="confirmPassword" v-model="confirmPassword" name="confirmPassword" type="password" required
				   class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
				   placeholder="••••••••••">
			<div id="errorConfirmPassword" class="mt-1 text-red-500"/>
		  </div>
		  <div class="pt-4">
			<button
type="submit"
					class="relative flex justify-center w-full px-4 py-1 font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
			  {{ $t('resetPassword.submit') }}
			</button>
		  </div>
		</form>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()
  
  const newPassword = ref('')
  const confirmPassword = ref('')
  const token = ref(route.query.token || '')
  
  const handleResetPassword = async () => {
	document.getElementById('errorNewPassword').textContent = ''
	document.getElementById('errorConfirmPassword').textContent = ''
  
	if (!newPassword.value || newPassword.value !== confirmPassword.value) {
	  document.getElementById('errorConfirmPassword').textContent = t('resetPassword.errors.mismatch')
	  return
	}
  
	try {
	  const data = await $fetch('/api/auth/reset-password', {
		method: 'POST',
		body: { token: token.value, newPassword: newPassword.value }
	  })
	  if (data) {
		router.push('/login?resetSuccess=true')
	  }
	} catch (error) {
	  document.getElementById('errorNewPassword').textContent = t('resetPassword.errors.failed')
	}
  }
  </script>
  