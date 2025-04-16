<template>
	<div class="flex items-center justify-center">
		<div class="max-w-sm w-full space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
			<h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
				{{ $t('register.title') }}
			</h2>
			<form @submit.prevent="handleRegister" class="space-y-1">
				<div class="flex space-x-2">
					<div class="w-1/2">
						<label class="text-xs" for="firstName">{{ $t('register.firstName') }}</label>
						<input
							id="firstName"
							v-model="firstName"
							name="firstName"
							type="text"
							required
							class="appearance-none text-2xs rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							:placeholder="$t('register.firstName')"
						>
						<div id="errorFirstName" class="text-red-500 text-sm mt-1"></div>
					</div>
					<div class="w-1/2">
						<label class="text-xs" for="lastName">{{ $t('register.lastName') }}</label>
						<input
							id="lastName"
							v-model="lastName"
							name="lastName"
							type="text"
							required
							class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
							:placeholder="$t('register.lastName')"
						>
						<div id="errorLastName" class="text-red-500 text-sm mt-1"></div>
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
						class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('register.usernamePlaceholder')"
					>
					<div id="errorUsername" class="text-red-500 text-sm mt-1"></div>
				</div>
				<div>
					<label class="text-xs" for="email">{{ $t('register.email') }}</label>
					<input
						id="email"
						v-model="email"
						name="email"
						type="email"
						required
						class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						:placeholder="$t('register.email')"
					>
					<div id="errorEmail" class="text-red-500 text-sm mt-1"></div>
				</div>
				<div>
					<label class="text-xs" for="password">{{ $t('register.password') }}</label>
					<input
						id="password"
						v-model="password"
						name="password"
						type="password"
						required
						class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="••••••••••"
					>
					<div id="errorPassword" class="text-red-500 text-sm mt-1"></div>
				</div>
				<div>
					<label class="text-xs" for="confirmPassword">{{ $t('register.confirmPassword') }}</label>
					<input
						id="confirmPassword"
						v-model="confirmPassword"
						name="confirmPassword"
						type="password"
						required
						class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="••••••••••"
					>
					<div id="errorConfirmPassword" class="text-red-500 text-sm mt-1"></div>
				</div>
				<div class="pt-4">
					<button
						type="submit"
						class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
       const data = await $fetch('/api/auth/register', {
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

       if (data) {
           fetch()
           navigateTo('/')
       }
   } catch (error) {       
       // Handle specific error cases
       if (error.statusMessage === 'Username already exists') {
           document.getElementById('errorUsername').textContent = t('register.errors.usernameAlreadyExists')
       } else if (error.statusMessage === 'Email already in use') {
           document.getElementById('errorEmail').textContent = t('register.errors.EmailInUse')
       } else if (error.statusMessage === 'Password too weak') {
           document.getElementById('errorPassword').textContent = t('register.errors.passwordTooWeak')
	   } else if (error.statusMessage === 'Passwords do not match') {
		   document.getElementById('errorConfirmPassword').textContent = t('register.errors.passwordsDoNotMatch')
       } else {
           // Generic error handling
           document.getElementById('errorPassword').textContent = 'Registration failed'
       }
   }
}
</script>