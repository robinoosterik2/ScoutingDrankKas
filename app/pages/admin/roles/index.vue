<template>
  <!-- Page Title and Create Button -->
  <div>
    <CTitle :text="$t('roles.title')" />
  </div>

  <!-- Back to Admin Button -->
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')" />
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
      {
        header: $t('roles.roleName'),
        field: 'roleName',
        align: 'left',
        width: '20%',
      },
      {
        header: $t('roles.description'),
        field: 'roleDescription',
        align: 'left',
        width: '30%',
      },
      {
        header: $t('roles.permissions'),
        field: 'rolePermissions',
        align: 'left',
        width: '40%',
      },
      {
        header: $t('roles.actions'),
        field: 'actions',
        align: 'right',
        width: '10%',
      },
    ]"
    :data="
      roles.map((role) => ({
        ...role,
        rolePermissions: role.rolePermissions,
        actions: '',
      }))
    "
    :pagination="{
      page: currentPage,
      pageSize: pageSize,
      total: totalRoles,
    }"
    :no-data-text="$t('roles.emptyState')"
    scrollable
    max-height="calc(100vh - 300px)"
    @update:page="handlePageChange"
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
          class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 text-sm"
          @click="editRole(role)"
        >
          {{ $t("edit") }}
        </button>
        <button
          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 text-sm"
          @click="openDeleteConfirmation(role)"
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
    :is-open="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('role')"
    :message="`${$t('roles.confirmDelete')} '${roleToDelete?.roleName}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirm-text="$t('delete')"
    @confirm="confirmDelete"
    @close="closeDeleteConfirmation"
  />
</template>

<script setup>
import BackLink from "~/components/BackLink.vue";
import DataTable from "~/components/DataTable.vue";

// Reactive roles array
const roles = ref([]);
const totalRoles = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// Delete confirmation modal state
const isDeleteModalOpen = ref(false);
const roleToDelete = ref(null);

const fetchRoles = async () => {
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString(),
    });
    const response = await $fetch(`/api/roles/all?${params.toString()}`, {
      method: "GET",
    });
    roles.value = response.data;
    totalRoles.value = response.total;
  } catch (error) {
    console.error("Failed to fetch roles:", error);
  }
};

// Fetch roles on component mount
onMounted(async () => {
  fetchRoles();
});

watch(currentPage, () => {
  fetchRoles();
});

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
};

// Edit role method (navigate to edit page)
const editRole = (role) => {
  navigateTo(`/admin/roles/edit/${role.id}`);
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
    fetchRoles(); // Refresh list
  } catch (error) {
    alert("Failed to delete role. Please try again.");
  }
};

// Confirm delete action
const confirmDelete = () => {
  if (roleToDelete.value) {
    deleteRole(roleToDelete.value.id);
    closeDeleteConfirmation();
  }
};
</script>
