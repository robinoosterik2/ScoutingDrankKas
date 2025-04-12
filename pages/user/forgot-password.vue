<template>
	<div class="flex items-center justify-center h-max">
		<div class="w-full max-w-sm p-4 space-y-2 bg-white rounded-lg shadow-md dark:bg-gray-800">
			<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
				{{ $t('forgotPassword.title') }}
			</h2>
			<div v-if="emailSent" class="text-center text-green-500">
				{{ $t('forgotPassword.emailSent') }}
			</div>
			<form v-else @submit.prevent="handleForgotPassword" class="space-y-2">
				<div>
					<label for="email">{{ $t('forgotPassword.email') }}</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('forgotPassword.emailPlaceholder')"
					>
					<div id="errorEmail" class="mt-1 text-red-500"></div>
				</div>
				<div class="pt-4">
					<button
						type="submit"
						class="relative flex justify-center w-full px-4 py-1 font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						{{ $t('forgotPassword.submit') }}
					</button>
				</div>
				<div class="text-center">
					<NuxtLink to="/login" class="text-blue-600 hover:text-blue-800">
						{{ $t('forgotPassword.backToLogin') }}
					</NuxtLink>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const emailSent = ref(false)
const { t } = useI18n()

const handleForgotPassword = async () => {
	document.getElementById('errorEmail').textContent = ''

	try {
		const data = await $fetch('/api/auth/requestResetPassword', {
			method: 'POST',
			body: { email: email.value }
		})
		
		if (data && data.success) {
			emailSent.value = true
		}
	} catch (error) {
		if (error.statusCode === 404) {
			document.getElementById('errorEmail').textContent = t('forgotPassword.errors.userNotFound')
		} else {
			document.getElementById('errorEmail').textContent = t('forgotPassword.errors.failed')
		}
	}
}
</script>
