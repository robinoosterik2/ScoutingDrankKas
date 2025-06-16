<template>
  <!-- Page Title and Create Button -->
  <div>
    <CTitle :text="$t('roles.title')" />
  </div>

  <!-- Back to Admin Button -->
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :backPage="$t('admin.title')"></BackLink>
    <div>
      <DashboardLink
        to="/admin/roles/create"
        type="primary"
        :label="$t('roles.createRole')"
        class="h-min"
      />
    </div>
  </div>

  <!-- Roles Table -->
  <DataTable
    :columns="[
      { header: $t('roles.roleName'), field: 'roleName', align: 'left' },
      { header: $t('roles.description'), field: 'roleDescription', align: 'left' },
      { header: $t('roles.permissions'), field: 'rolePermissions', align: 'left' },
      { header: $t('roles.actions'), field: 'actions', align: 'right' },
    ]"
    :data="roles.map(role => ({
      ...role,
      rolePermissions: role.rolePermissions,
      actions: ''
    }))"
    :no-data-text="$t('roles.emptyState')"
  >
    <template #cell-rolePermissions="{ row: role }">
      <div class="flex flex-wrap gap-1">
        <span
          v-for="permission in role.rolePermissions"
          :key="permission"
          class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
        >
          {{ permission }}
        </span>
      </div>
    </template>
    
    <template #cell-actions="{ row: role }">
      <div class="flex justify-end space-x-2">
        <button
          @click="editRole(role)"
          class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm"
        >
          {{ $t("edit") }}
        </button>
        <button
          @click="openDeleteConfirmation(role)"
          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 text-sm"
        >
          {{ $t("delete") }}
        </button>
      </div>
    </template>
    
    <template #empty>
      <div class="text-center py-12 px-4 sm:px-6 lg:px-8">
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
          {{ $t("roles.emptyState") }}
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t("roles.emptyStateDescription") }}
        </p>
      </div>
    </template>
  </DataTable>

  <!-- Delete Confirmation Modal -->
  <ConfirmDelete
    :isOpen="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('role')"
    :message="`${$t('roles.confirmDelete')} '${roleToDelete?.roleName}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirmText="$t('delete')"
    @confirm="confirmDelete"
    @close="closeDeleteConfirmation"
  />
</template>

<script setup>
import BackLink from "~/components/BackLink.vue";
import DataTable from '~/components/DataTable.vue';

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
