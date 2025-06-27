<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Back to Users Button -->
    
    <CTitle :text="userId ? $t('users.editUser') : $t('users.createUser')"/>
    
    <BackLink to="/admin/users" back-page="Users"/>
    <!-- Edit User Form -->
    <form
      class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-xl mx-auto"
      @submit.prevent="saveUser"
    >
      <div class="grid grid-cols-2 gap-4">
        <!-- First Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="firstName"
          >
            First Name
          </label>
          <input
            id="firstName"
            v-model="formData.firstName"
            type="text"
            required
            class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          >
        </div>

        <!-- Last Name -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="lastName"
          >
            Last Name
          </label>
          <input
            id="lastName"
            v-model="formData.lastName"
            type="text"
            required
            class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          >
        </div>
      </div>

      <!-- Username -->
      <div class="mt-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="username"
        >
          Username
        </label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          required
          class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
        >
      </div>

      <!-- Email -->
      <div class="mt-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="email"
        >
          Email
        </label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          required
          class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
        >
      </div>

      <!-- Password (only for new users or reset) -->
      <div v-if="!userId" class="mt-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="password"
        >
          Password
        </label>
        <input
          id="password"
          v-model="formData.password"
          type="password"
          required
          class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
        >
      </div>

      <!-- Role Selection -->
      <div class="mt-4">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Role
        </label>
        <select
          v-model="formData.role"
          class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option
            v-for="role in availableRoles"
            :key="role._id"
            :value="role._id"
          >
            {{ role.roleName }} - {{ role.roleDescription }}
          </option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          @click="navigateTo('/admin/users')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {{ userId ? "Update User" : "Create User" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import BackLink from "~/components/BackLink.vue";

// Get user ID from route
const route = useRoute();
const userId = ref(route.params.id || null);

// Available roles state
const availableRoles = ref([]);

// Form data reactive state
const formData = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  role: "",
});

// Fetch roles on component mount
onMounted(async () => {
  try {
    // Fetch all available roles
    availableRoles.value = await $fetch("/api/roles/all", { method: "GET" });

    // Fetch user data if editing
    if (userId.value) {
      const user = await $fetch(`/api/users/${userId.value}`, {
        method: "GET",
      });
      formData.value = {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role:
          user.role ||
          availableRoles.value[availableRoles.value.length - 1]?.roleName ||
          "",
      };
    }
  } catch (error) {
    console.error("Failed to fetch roles or user:", error);
    alert("Failed to fetch roles or user details. Please try again.");
  }
});

// Save user method (create or update)
const saveUser = async () => {
  try {
    const result = await $fetch("/api/admin/users/update", {
      method: "POST",
      body: JSON.stringify({
        id: userId.value,
        ...formData.value,
      }),
    });

    // Redirect back to users list after successful save
    navigateTo("/admin/users");
  } catch (error) {
    console.error("Failed to save user:", error);
    alert(error.message || "Failed to save user. Please try again.");
  }
};
</script>
