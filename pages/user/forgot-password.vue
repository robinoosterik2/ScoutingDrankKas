<template>
	<div class="flex items-center justify-center">
		<div class="w-full max-w-sm p-4 space-y-2 bg-white rounded-lg shadow-md dark:bg-gray-800">
			<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
				{{ $t('forgotPassword.title') }}
			</h2>
			<form @submit.prevent="handleForgotPassword" class="space-y-1">
				<div>
					<label class="text-xs" for="email">{{ $t('Email') }}</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('forgotPassword.email')"
					>
					<div v-if="errorEmail" id="errorEmail" class="mt-1 text-sm text-red-500">
						{{ errorEmail }}
					</div>
				</div>
				<div class="pt-4">
					<button
						type="submit"
						:disabled="loading"
						class="relative flex justify-center w-full px-4 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<span v-if="!loading">{{ $t('Submit') }}</span>
						<span v-else>{{ $t('Loading') }}</span>
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Popup Component -->
	<PopUp
		v-if="showPopup"
		:title="$t('forgotPassword.successTitle')"
		:message="$t('forgotPassword.success', { email: email })"
		@close="showPopup = false"
	/>
</template>

<script setup>
import { ref } from 'vue'
import PopUp from '~/components/PopUp.vue'

const email = ref('')
const errorEmail = ref('')
const loading = ref(false)
const showPopup = ref(false)

const handleForgotPassword = async () => {
	errorEmail.value = ''
	loading.value = true

	try {
		const data = await $fetch('/api/auth/requestResetPassword', {
			method: 'POST',
			body: { email: email.value }
		})
		if (data) {
			showPopup.value = true
		}
	} catch (error) {
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
