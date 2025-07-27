<template>
  <CTitle :text="$t('users.title')" />
  <div class="flex items-center justify-between mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')"/>
  </div>

  <!-- Filters and Sorting -->
  <div class="flex w-full flex-wrap">
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 mb-4 me-4 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
    <select
      v-model="selectedRole"
      class="px-3 py-2 mb-4 me-4 text-sm border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option value="">{{ $t("roles.roles") }}</option>
      <option v-for="role in roles" :key="role" :value="role">
        {{ role.roleName }}
      </option>
    </select>
  </div>

  <!-- Users DataTable -->
  <DataTable
    :columns="[
      {
        header: $t('username'),
        field: 'username',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('email'),
        field: 'email',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('role'),
        field: 'role',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('Balance'),
        field: 'balance',
        align: 'left',
        sortable: true,
      },
      { header: $t('actions'), field: 'actions', align: 'right' },
    ]"
    :data="
      filteredAndSortedUsers.map((user) => ({
        ...user,
        actions: '',
      }))
    "
    :sort-field="sortBy"
    :sort-direction="sortDirection"
    :no-data-text="$t('users.noUsers')"
    @sort="handleSort"
  >
    <template #cell-role="{ row: user }">
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
    </template>

    <template #cell-balance="{ row: user }">
      <div
        class="text-sm"
        :class="{
          'text-red-500 dark:text-red-300': user.balance < 0,
          'text-green-500 dark:text-green-300': user.balance >= 0,
        }"
      >
        {{ format(user.balance) }}
      </div>
    </template>

    <template #cell-actions="{ row: user }">
      <div class="flex justify-end">
        <CDropdown
          :id="`user-dropdown-${user._id}`"
          :model-value="null"
          :items="dropdownItems"
          :placeholder="$t('Actions')"
          class="min-w-24"
          @update:model-value="(value) => handleAction(user, value)"
        />
      </div>
    </template>

    <template #empty>
      <div class="text-center py-12 px-4 sm:px-6 lg:px-8">
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
    </template>
  </DataTable>

  <!-- Delete Confirmation Modal -->
  <DeleteConfirmationModal
    :is-open="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('User')"
    :message="`${$t('users.confirmDelete')} '${userToDelete?.username}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirm-text="$t('delete')"
    :cancel-text="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />

  <RaisePopUpModal
    :is-open="isPopupOpen"
    :user-id="selectedUserId"
    @close="closePopup"
    @balance-updated="handleBalanceUpdated"
  />
</template>

<script setup>
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";
import RaisePopUpModal from "@/components/RaisePopUp";
import DataTable from "~/components/DataTable.vue";

const { format } = useMoney();

const roles = ref([]);
const users = ref([]);
const searchQuery = ref("");
const selectedRole = ref("");
const sortBy = ref("username"); // Changed from "name" to "username" to match the actual field
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
      if (sortBy.value === "username") {
        return a.username.localeCompare(b.username) * direction;
      } else if (sortBy.value === "email") {
        return a.email.localeCompare(b.email) * direction;
      } else if (sortBy.value === "role") {
        const aRole = a.role?.roleName || "";
        const bRole = b.role?.roleName || "";
        return aRole.localeCompare(bRole) * -direction;
      } else if (sortBy.value === "balance") {
        return (a.balance - b.balance) * -direction;
      }
      return 0;
    });
});

// Handle sort event from DataTable
const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
};

// Modified handleAction to accept the selected value directly
const handleAction = (user, action) => {
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
  navigateTo(`/admin/users/edit/${user.id}`);
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
