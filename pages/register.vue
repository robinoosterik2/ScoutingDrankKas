<template>
	<div class="flex items-center justify-center">
	   <div class="max-w-sm w-full space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
		   <h2 class="text-xl font-extrabold text-center text-gray-900 dark:text-white">
			   Register
		   </h2>
		   <form @submit.prevent="handleRegister" class="space-y-2">
			   <div class="flex space-x-2">
				   <div class="w-1/2">
					   <label class="text-xs" for="firstName">First Name:</label>
					   <input
						   id="firstName"
						   v-model="firstName"
						   name="firstName"
						   type="text"
						   required
						   class="appearance-none text-2xs rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						   placeholder="First Name"
					   >
					   <div id="errorFirstName" class="text-red-500 text-sm mt-1"></div>
				   </div>
				   <div class="w-1/2">
					   <label class="text-xs" for="lastName">Last Name:</label>
					   <input
						   id="lastName"
						   v-model="lastName"
						   name="lastName"
						   type="text"
						   required
						   class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						   placeholder="Last Name"
					   >
					   <div id="errorLastName" class="text-red-500 text-sm mt-1"></div>
				   </div>
			   </div>
			   <div>
				   <label class="text-xs" for="username">Username:</label>
				   <input
					   id="username"
					   v-model="username"
					   name="username"
					   type="text"
					   required
					   class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
					   placeholder="Username"
				   >
				   <div id="errorUsername" class="text-red-500 text-sm mt-1"></div>
			   </div>
			   <div>
				   <label class="text-xs" for="email">Email:</label>
				   <input
					   id="email"
					   v-model="email"
					   name="email"
					   type="email"
					   required
					   class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
					   placeholder="Email"
				   >
				   <div id="errorEmail" class="text-red-500 text-sm mt-1"></div>
			   </div>
			   <div>
				   <label class="text-xs" for="password">Password:</label>
				   <input
					   id="password"
					   v-model="password"
					   name="password"
					   type="password"
					   required
					   class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
					   placeholder="************"
				   >
				   <div id="errorPassword" class="text-red-500 text-sm mt-1"></div>
			   </div>
			   <div>
				   <label class="text-xs" for="confirmPassword">Confirm Password:</label>
				   <input
					   id="confirmPassword"
					   v-model="confirmPassword"
					   name="confirmPassword"
					   type="password"
					   required
					   class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
					   placeholder="************"
				   >
				   <div id="errorConfirmPassword" class="text-red-500 text-sm mt-1"></div>
			   </div>
			   <div class="pt-4">
				   <button
					   type="submit"
					   class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				   >
					   Register
				   </button>
			   </div>
			   <div>
				   <div>Already have an account?
					   <NuxtLink to="/login" class="text-sm text-blue-600 hover:text-blue-800">
						   Login
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
       document.getElementById('errorConfirmPassword').textContent = 'Passwords do not match'
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
               password: password.value 
           }
       })

       if (data) {
           fetch()
           router.push('/')
       }
   } catch (error) {       
       // Handle specific error cases
       if (error.statusMessage === 'Username already exists') {
           document.getElementById('errorUsername').textContent = 'Username already exists'
       } else if (error.statusMessage === 'Email already in use') {
           document.getElementById('errorEmail').textContent = 'Email already in use'
       } else if (error.statusMessage === 'Password too weak') {
           document.getElementById('errorPassword').textContent = 'Password too weak'
	   } else if (error.statusMessage === 'Passwords do not match') {
		   document.getElementById('errorConfirmPassword').textContent = 'Passwords do not match'
       } else {
           // Generic error handling
           document.getElementById('errorPassword').textContent = 'Registration failed'
       }
   }
}
</script>