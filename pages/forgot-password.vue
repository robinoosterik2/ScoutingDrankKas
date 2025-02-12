<template>
	<div class="flex items-center justify-center">
		<div class="max-w-sm w-full space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
			<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
				{{ $t('forgotPassword.title') }}
			</h2>
			<form @submit.prevent="handleForgotPassword" class="space-y-1">
				<div>
					<label class="text-xs" for="email">{{ $t('forgotPassword.email') }}</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('forgotPassword.email')"
					>
					<div v-if="errorEmail" id="errorEmail" class="text-red-500 text-sm mt-1">
						{{ errorEmail }}
					</div>
				</div>
				<div class="pt-4">
					<button
						type="submit"
						:disabled="loading"
						class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<span v-if="!loading">{{ $t('forgotPassword.submit') }}</span>
						<span v-else>{{ $t('forgotPassword.loading') }}</span>
					</button>
				</div>
			</form>
			<div v-if="successMessage" class="text-green-500 text-sm mt-2">
				{{ successMessage }}
			</div>
		</div>
	</div>
</template>

<script setup>
const email = ref('')
const errorEmail = ref('')
const successMessage = ref('')
const loading = ref(false)

const handleForgotPassword = async () => {
	errorEmail.value = ''
	successMessage.value = ''
	loading.value = true

	try {
		const data = await $fetch('/api/auth/requestResetPassword', {
			method: 'POST',
			body: { email: email.value }
		})
		// If the API returns a positive response, show a success message.
		if (data) {
			successMessage.value = t('forgotPassword.success') // Make sure you define this in your i18n files.
		}
	} catch (error) {
		// Check error message from the API and display an appropriate error.
		if (error.statusMessage === 'Email not found') {
			errorEmail.value = t('forgotPassword.errors.emailNotFound')
		} else {
			errorEmail.value = t('forgotPassword.errors.requestFailed')
		}
	} finally {
		loading.value = false
	}
}
</script>
