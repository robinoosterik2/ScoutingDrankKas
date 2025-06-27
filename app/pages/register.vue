<template>
	<div class="flex items-center justify-center">
		<div class="w-full max-w-sm p-4 space-y-2 bg-white rounded-lg shadow-md dark:bg-gray-800">
			<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
				{{ $t('register.title') }}
			</h2>
			<form class="space-y-1" @submit.prevent="handleRegister">
				<div class="flex space-x-2">
					<div class="w-1/2">
						<label class="text-xs" for="firstName">{{ $t('register.firstName') }}</label>
						<input
							id="firstName"
							v-model="firstName"
							name="firstName"
							type="text"
							required
							class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none text-2xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							:placeholder="$t('register.firstName')"
						>
						<div id="errorFirstName" class="mt-1 text-sm text-red-500"/>
					</div>
					<div class="w-1/2">
						<label class="text-xs" for="lastName">{{ $t('register.lastName') }}</label>
						<input
							id="lastName"
							v-model="lastName"
							name="lastName"
							type="text"
							required
							class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							:placeholder="$t('register.lastName')"
						>
						<div id="errorLastName" class="mt-1 text-sm text-red-500"/>
					</div>
				</div>
				<div>
					<label class="text-xs" for="username">{{ $t('register.username') }}</label>
					<input
						id="username"
						v-model="username"
						name="username"
						type="text"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('register.usernamePlaceholder')"
					>
					<div id="errorUsername" class="mt-1 text-sm text-red-500"/>
				</div>
				<div>
					<label class="text-xs" for="email">{{ $t('register.email') }}</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('register.email')"
					>
					<div id="errorEmail" class="mt-1 text-sm text-red-500"/>
				</div>
				<div>
					<label class="text-xs" for="password">{{ $t('register.password') }}</label>
					<input
						id="password"
						v-model="password"
						name="password"
						type="password"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="••••••••••"
					>
					<div id="errorPassword" class="mt-1 text-sm text-red-500"/>
				</div>
				<div>
					<label class="text-xs" for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
					<input
						id="confirmPassword"
						v-model="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						class="relative block w-full px-3 py-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="••••••••••"
					>
					<div id="errorConfirmPassword" class="mt-1 text-sm text-red-500"/>
				</div>
				<div class="pt-4">
					<button
						type="submit"
						class="relative flex justify-center w-full px-4 py-1 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						{{ $t('register.submit') }}
					</button>
				</div>
				<div>
					<div>{{ $t('register.alreadyHaveAccount') }}
						<NuxtLink to="$localePath('/login')" class="text-sm text-blue-600 hover:text-blue-800">
							{{ $t('register.login') }}
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const firstName = ref('')
const lastName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleRegister = async () => {
	// Clear previous error messages
	document.getElementById('errorFirstName').textContent = ''
	document.getElementById('errorLastName').textContent = ''
	document.getElementById('errorUsername').textContent = ''
	document.getElementById('errorEmail').textContent = ''
	document.getElementById('errorPassword').textContent = ''
	document.getElementById('errorConfirmPassword').textContent = ''

   // Validate password match
   if (password.value !== confirmPassword.value) {
       document.getElementById('errorConfirmPassword').textContent = t('register.errors.passwordsDoNotMatch')
       return
   }

   try {
       await $fetch('/api/auth/register', {
           method: 'POST',
           body: { 
               firstName: firstName.value,
               lastName: lastName.value,
               username: username.value,
               email: email.value,
               password: password.value,
			   confirmPassword: confirmPassword.value
           }
       })
       // Successful registration
       navigateTo('/') // Navigate to home or dashboard
   } catch (error) {
       const statusMessage = error.data?.statusMessage || error.statusMessage || ''
       
       if (statusMessage === 'Username and password are required') {
           // This error is general, let's show it under the password field or a general error area if available.
           // For now, under password as it's a key part of credentials.
           document.getElementById('errorPassword').textContent = t('register.errors.credentialsRequired')
       } else if (statusMessage === 'Username already exists') {
           document.getElementById('errorUsername').textContent = t('register.errors.usernameAlreadyExists')
       } else if (statusMessage === 'Email already exists') { // Backend uses "Email already exists"
           document.getElementById('errorEmail').textContent = t('register.errors.emailInUse') // Frontend key is emailInUse
       } else if (statusMessage === 'User already has an account') {
           document.getElementById('errorLastName').textContent = t('register.errors.userAlreadyExistsWithFullName')
       } else if (statusMessage === 'Password must be at least 8 characters') {
           document.getElementById('errorPassword').textContent = t('register.errors.passwordTooShort')
	   } else if (statusMessage === 'Passwords do not match') { // This is also checked client-side, but good to handle backend error too
		   document.getElementById('errorConfirmPassword').textContent = t('register.errors.passwordsDoNotMatch')
       } else {
           // Generic error handling
           document.getElementById('errorPassword').textContent = t('register.errors.registrationFailed')
       }
   }
}
</script>