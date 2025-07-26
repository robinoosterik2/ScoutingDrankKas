<template>
  <div class="flex items-center justify-center">
    <div class="w-full flex flex-col items-center justify-center">
      <div class="max-w-sm w-full mb-2">
      <CTitle :text="$t('roles.title')"/>
        <BackLink to="/admin/roles" :back-page="$t('roles.roles')"/>
      </div>
      <div
        class="max-w-sm w-full space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        

        <form class="space-y-2" @submit.prevent="createCustomRole">
          <div>
            <label class="text-xs" for="roleName"
              >{{ $t("roles.roleName") }}:</label
            >
            <input
              id="roleName"
              v-model="roleForm.roleName"
              name="roleName"
              type="text"
              required
              class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              :placeholder="$t('roles.enterRoleName')"
            >
            <div id="errorRoleName" class="text-red-500 text-sm mt-1"/>
          </div>

          <div>
            <label class="text-xs" for="roleDescription"
              >{{ $t("roles.roleDescription") }}:</label
            >
            <textarea
              id="roleDescription"
              v-model="roleForm.roleDescription"
              name="roleDescription"
              required
              class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              :placeholder="$t('roles.enterRoleDescription')"
              rows="3"
            />
            <div
              id="errorRoleDescription"
              class="text-red-500 text-sm mt-1"
            />
          </div>

          <label class="text-xs block mb-2"
            >{{ $t("roles.permissions") }}:</label
          >
          <div class="grid grid-cols-2 gap-2 mt-1">
            <div
              v-for="permission in availablePermissions"
              :key="permission"
              class="flex items-center space-x-2"
            >
              <input
                :id="permission"
                type="checkbox"
                :checked="roleForm.rolePermissions.includes(permission)"
                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                @change="togglePermission(permission)"
              >
              <label
                :for="permission"
                class="text-sm text-gray-700 dark:text-gray-300"
              >
                {{ permission }}
              </label>
            </div>
            <div
              id="errorRolePermissions"
              class="text-red-500 text-sm mt-1"
            />
          </div>

          <div class="pt-4">
            <button
              type="submit"
              class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ $t("roles.createRole") }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const availablePermissions = ["admin", "stam", "scouting-lid", "extern"];

const roleForm = ref({
  roleName: "",
  roleDescription: "",
  rolePermissions: [],
});

// Custom method to toggle permissions
const togglePermission = (permission) => {
  const index = roleForm.value.rolePermissions.indexOf(permission);
  if (index > -1) {
    // Remove permission if already exists
    roleForm.value.rolePermissions.splice(index, 1);
  } else {
    // Add permission
    roleForm.value.rolePermissions.push(permission);
  }
};

const createCustomRole = async () => {
  // Reset previous errors
  document.getElementById("errorRoleName").textContent = "";
  document.getElementById("errorRoleDescription").textContent = "";
  document.getElementById("errorRolePermissions").textContent = "";

  let hasError = false;

  if (!roleForm.value.roleName) {
    document.getElementById("errorRoleName").textContent = $t(
      "roles.roleNameRequired"
    );
    hasError = true;
  }

  if (!roleForm.value.roleDescription) {
    document.getElementById("errorRoleDescription").textContent = $t(
      "roles.roleDescriptionRequired"
    );
    hasError = true;
  }

  if (hasError) return;

  try {
    const data = await $fetch("/api/admin/roles/create", {
      method: "POST",
      body: roleForm.value,
    });

    navigateTo("/admin/roles");
  } catch (error) {
    if (error.statusMessage === "Role name already exists") {
      document.getElementById("errorRoleName").textContent = $t(
        "roles.roleNameExists"
      );
    } else {
      console.error(error);
      document.getElementById("errorRoleName").textContent = $t(
        "roles.createRoleError"
      );
    }
  }
};
</script>
