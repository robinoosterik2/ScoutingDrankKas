<template>
  <CTitle :text="$t('users.title')" />
  <div class="flex items-center justify-between mb-2">
    <BackLink to="/admin" :backPage="$t('admin.title')"></BackLink>
    <div>
      <DashboardLink
        to="/register"
        class="px-4 py-2 font-bold text-white transition duration-300 ease-in-out bg-indigo-600 rounded-md hover:bg-indigo-700"
      >
        {{ $t("users.createUser") }}
      </DashboardLink>
    </div>
  </div>

  <!-- Filters and Sorting -->
  <div class="flex mb-4 space-x-4">
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    />
    <select
      v-model="selectedRole"
      class="px-3 py-2 text-sm border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option value="">{{ $t("roles.roles") }}</option>
      <option v-for="role in roles" :key="role" :value="role">
        {{ role.roleName }}
      </option>
    </select>
    <select
      v-model="sortBy"
      class="px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option value="name">{{ $t("sortBy") }} {{ $t("names") }}</option>
      <option value="email">{{ $t("sortBy") }} {{ $t("email") }}</option>
      <option value="role">{{ $t("sortBy") }} {{ $t("roles.roles") }}</option>
      <option value="balance">{{ $t("sortBy") }} {{ $t("Balance") }}</option>
    </select>
    <button
      @click="toggleSortDirection"
      class="px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      {{ sortDirection === "asc" ? "▲" : "▼" }}
    </button>
  </div>

  <!-- Users Table -->
  <div
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
  >
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr class="overflow-visible">
          <th
            class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
          >
            {{ $t("username") }}
          </th>
          <th
            class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
          >
            {{ $t("email") }}
          </th>
          <th
            class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
          >
            {{ $t("role") }}
          </th>
          <th
            class="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
          >
            {{ $t("Balance") }}
          </th>
          <th
            class="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-300"
          >
            {{ $t("actions") }}
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
      >
        <tr
          v-for="user in filteredAndSortedUsers"
          :key="user.id"
          class="relative overflow-visible transition duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ user.username }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ user.email }}
            </div>
          </td>
          <td class="px-6 py-2">
            <span
              v-if="user.role"
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                  user.role.roleName === 'Admin',
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':
                  user.role.roleName === 'Stam',
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200':
                  user.role.roleName === 'Lid',
              }"
            >
              {{ user.role.roleName }}
            </span>
            <span
              v-else
              class="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-200"
            >
              NoRole
            </span>
          </td>
          <td>
            <div
              class="px-6 text-sm"
              :class="{
                'text-red-500 dark:text-red-300': user.balance < 0,
                'text-green-500 dark:text-green-300': user.balance >= 0,
              }"
            >
              €{{ user.balance }}
            </div>
          </td>
          <td
            class="px-6 py-2 overflow-visible text-sm font-medium text-right whitespace-nowrap"
          >
            <!-- custom id for each user -->
            <CDropdown
              v-model="selectedValue"
              :items="dropdownItems"
              @update:model-value="handleAction(user)"
              value="action"
              :placeholder="$t('Actions')"
              :id="`user-${user._id}`"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Empty State -->
    <div
      v-if="filteredAndSortedUsers.length === 0"
      class="px-4 py-12 text-center sm:px-6 lg:px-8"
    >
      <svg
        class="w-12 h-12 mx-auto text-gray-400"
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
        {{ $t("users.noUsers") }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t("users.getStarted") }}
      </p>
    </div>
  </div>
  <!-- Delete Confirmation Modal -->
  <DeleteConfirmationModal
    :isOpen="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('User')"
    :message="`${$t('users.confirmDelete')} '${userToDelete?.username}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirmText="$t('delete')"
    :cancelText="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />

  <RaisePopUpModal
    :isOpen="isPopupOpen"
    :user-id="selectedUserId"
    @close="closePopup"
    @balanceUpdated="handleBalanceUpdated"
  />
</template>

<script setup>
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";
import RaisePopUpModal from "@/components/RaisePopUp";

const roles = ref([]);
const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");
const isPopupOpen = ref(false);
const selectedUserId = ref(null);
const { t } = useI18n();

// Define the items for the dropdown
const dropdownItems = ref([
  { label: t("edit"), value: "edit" },
  { label: t("delete"), value: "delete" },
  { label: t("Raise"), value: "raise" },
]);

// Define the variable to hold the selected value
const selectedValue = ref(null);

try {
  roles.value = await $fetch("/api/roles/all", { method: "GET" });
  users.value = await $fetch("/api/users/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch users:", error);
}

const filteredAndSortedUsers = computed(() => {
  return users.value
    .filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase());

      // Only apply role filter if a role is selected
      if (selectedRole.value) {
        // If user has no role, don't show them when a role is selected
        if (!user.role) return false;
        // Check if user's role matches the selected role
        return (
          matchesSearch && user.role.roleName === selectedRole.value.roleName
        );
      }

      // If no role is selected, only apply search filter
      return matchesSearch;
    })
    .sort((a, b) => {
      const direction = sortDirection.value === "asc" ? 1 : -1;
      if (sortBy.value === "name") {
        return a.username.localeCompare(b.username) * direction;
      } else if (sortBy.value === "email") {
        return a.email.localeCompare(b.email) * direction;
      } else if (sortBy.value === "role") {
        return a.role.roleName.localeCompare(b.role.roleName) * direction;
      } else if (sortBy.value === "balance") {
        return (a.balance - b.balance) * direction;
      }
      return 0;
    });
});

const handleAction = (user) => {
  let action = selectedValue.value;
  if (action === "edit") {
    editUser(user);
  } else if (action === "delete") {
    openDeleteConfirmation(user);
  } else if (action === "raise") {
    openRaisePopUp(user);
  }
};

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

const openRaisePopUp = (user) => {
  selectedUserId.value = user.id; // Pass the selected user's ID
  console.log("selectedUserId", user);
  isPopupOpen.value = true;
};

const closePopup = () => {
  isPopupOpen.value = false;
  selectedUserId.value = null;
};

// Handle balance updated event from RaisePopUp
const handleBalanceUpdated = async ({ userId, newBalance }) => {
  // Update the user's balance in the local state
  const userIndex = users.value.findIndex((user) => user.id === userId);
  if (userIndex !== -1) {
    users.value[userIndex].balance = newBalance;
  }
  closePopup();
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
    await $fetch(`/api/admin/users/delete`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    users.value = users.value.filter((user) => user.id !== userId);
  } catch (error) {
    alert("Failed to delete user. Please try again.");
  }
};

// Confirm delete action
const confirmDelete = () => {
  if (userToDelete.value) {
    deleteUser(userToDelete.value.id);
    closeDeleteConfirmation();
  }
};
</script>
