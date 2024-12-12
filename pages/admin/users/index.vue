<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Back to Admin Button -->
    <BackLink to="/admin" backPage="Admin"></BackLink>

    <!-- Page Title and Create Button -->
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white">
        User Management
      </h1>
      <div class="">
        <DashboardLink
          to="/register"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Register
        </DashboardLink>
      </div>
    </div>
    <!-- Filters and Sorting -->
    <div class="mb-4 flex space-x-4">
      <!-- Search Input -->
      <input
        v-model="searchQuery"
        placeholder="Search users..."
        class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      />

      <select
        v-model="selectedRole"
        class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      >
        <option value="">All Roles</option>
        <option v-for="role in roles" :key="role" :value="role">
          {{ role.roleName }}
        </option>
      </select>
      <select
        v-model="sortBy"
        class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      >
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
        <option value="role">Sort by Role</option>
      </select>

      <button
        @click="toggleSortDirection"
        class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      >
        {{ sortDirection === "asc" ? "▲" : "▼" }}
      </button>
    </div>
    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Role
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
        >
          <tr
            v-for="user in filteredAndSortedUsers"
            :key="user.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ user.username }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500 dark:text-gray-300">
                {{ user.email }}
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                v-if="user.role"
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                    user.role.roleName === 'Admin',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
                    user.role.roleName === 'Editor',
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200':
                    user.role.roleName === 'Viewer',
                }"
              >
                {{ user.role.roleName }}
              </span>
              <span
                v-else
                class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              >
                No Role
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end space-x-2">
                <button
                  @click="editUser(user)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                >
                  Edit
                </button>
                <button
                  @click="openDeleteConfirmation(user)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Empty State -->
      <div
        v-if="filteredAndSortedUsers.length === 0"
        class="text-center py-12 px-4 sm:px-6 lg:px-8"
      >
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No users found
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new user.
        </p>
      </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="isDeleteModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
        >
          <button
            @click="closeDeleteConfirmation"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="text-center">
            <div
              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-red-600 dark:text-red-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3
              class="text-lg font-medium leading-6 text-gray-900 dark:text-white mt-4"
            >
              Delete User
            </h3>

            <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">
              Are you sure you want to delete the user "{{
                userToDelete?.username
              }}"? This action cannot be undone.
            </p>

            <div class="mt-5 sm:flex sm:flex-row-reverse">
              <button
                @click="confirmDelete"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                @click="closeDeleteConfirmation"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["admin"],
});

const roles = ref([]);
const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");

try {
  roles.value = await $fetch("/api/roles/all", { method: "GET" });
  users.value = await $fetch("/api/users/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch users:", error);
  alert("Failed to fetch users. Please try again.");
}

const filteredAndSortedUsers = computed(() => {
  return users.value
    .filter((user) => {
      // Search filter
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase());

      // Role filter
      const matchesRole =
        !selectedRole.value || user.role.includes(selectedRole.value);

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const sortKey = sortBy.value;
      const direction = sortDirection.value === "asc" ? 1 : -1;
      if (a[sortKey] < b[sortKey]) return -1 * direction;
      if (a[sortKey] > b[sortKey]) return 1 * direction;
      return 0;
    });
});

// Edit user method (navigate to edit page)
const editUser = (user) => {
  navigateTo(`/admin/users/edit/${user._id}`);
};

// Delete confirmation modal state
const isDeleteModalOpen = ref(false);
const userToDelete = ref(null);

// Open delete confirmation modal
const openDeleteConfirmation = (user) => {
  userToDelete.value = user;
  isDeleteModalOpen.value = true;
};

// Close delete confirmation modal
const closeDeleteConfirmation = () => {
  isDeleteModalOpen.value = false;
  userToDelete.value = null;
};

// Toggle sort direction
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const deleteUser = async (userId) => {
  try {
    await $fetch(`/api/users/delete`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    users.value = users.value.filter((user) => user._id !== userId);
  } catch (error) {
    alert("Failed to delete user. Please try again.");
  }
};

// Confirm delete action
const confirmDelete = () => {
  if (userToDelete.value) {
    deleteUser(userToDelete.value._id);
    closeDeleteConfirmation();
  }
};
</script>
