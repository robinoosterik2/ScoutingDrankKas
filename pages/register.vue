<template>
	<div>
		<h1>Create a New User</h1>
		<form @submit.prevent="submitForm">
			<div>
				<label for="username">Username:</label>
				<input v-model="username" type="text" id="username" required />
			</div>
			<div>
				<label for="password">Password:</label>
				<input v-model="password" type="password" id="password" required />
			</div>
			<button type="submit">Create User</button>
		</form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			username: "",
			password: ""
		};
	},
	methods: {
		async submitForm() {
			try {
				const response = await $fetch("/api/auth/register", {
                    method: "POST",
                    body: {
                        username: this.username,
                        password: this.password
                    }
                });
                console.log(response);
				alert('User created successfully');
			} catch (error) {
				console.error(error);
				alert('Error creating user');
			}
		}
	}
};
</script>
