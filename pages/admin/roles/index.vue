<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Page Title and Create Button -->
    <div class="">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Role Management
      </h1>
    </div>

    <!-- Back to Admin Button -->
    <div class="flex justify-between items-center mb-2">
      <BackLink to="/admin" backPage="Admin"></BackLink>
      <div>
        <DashboardLink
          to="/admin/roles/create"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Create New Role
        </DashboardLink>
      </div>
    </div>

    <!-- Roles Table -->
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Role Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Description
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
            >
              Permissions
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
            v-for="role in roles"
            :key="role.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">
                {{ role.roleName }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-500 dark:text-gray-300">
                {{ role.roleDescription }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="permission in role.rolePermissions"
                  :key="permission"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {{ permission }}
                </span>
              </div>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <div class="flex justify-end space-x-2">
                <button
                  @click="editRole(role)"
                  class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                >
                  Edit
                </button>
                <button
                  @click="openDeleteConfirmation(role)"
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
        v-if="roles.length === 0"
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No roles created
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new role.
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
              Delete Role
            </h3>

            <p class="text-sm text-gray-500 dark:text-gray-300 mt-2">
              Are you sure you want to delete the role "{{
                roleToDelete?.roleName
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
import { ref, onMounted } from "vue";
import BackLink from "~/components/BackLink.vue";

// Reactive roles array
const roles = ref([]);

// Delete confirmation modal state
const isDeleteModalOpen = ref(false);
const roleToDelete = ref(null);

// Fetch roles on component mount
onMounted(async () => {
  try {
    roles.value = await $fetch("/api/roles/all", { method: "GET" });
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    // Optional: Add error toast/notification
  }
});

// Edit role method (navigate to edit page)
const editRole = (role) => {
  navigateTo(`/admin/roles/edit/${role._id}`);
};

// Open delete confirmation modal
const openDeleteConfirmation = (role) => {
  roleToDelete.value = role;
  isDeleteModalOpen.value = true;
};

// Close delete confirmation modal
const closeDeleteConfirmation = () => {
  isDeleteModalOpen.value = false;
  roleToDelete.value = null;
};

// Confirm and execute role deletion
const deleteRole = async (roleId) => {
  try {
    await $fetch(`/api/admin/roles/delete`, {
      method: "POST",
      body: JSON.stringify({ roleId }),
    });
    roles.value = roles.value.filter((role) => role._id !== roleId);
  } catch (error) {
    alert("Failed to delete role. Please try again.");
  }
};

// Confirm delete action
const confirmDelete = () => {
  if (roleToDelete.value) {
    deleteRole(roleToDelete.value._id);
    closeDeleteConfirmation();
  }
};
</script>
