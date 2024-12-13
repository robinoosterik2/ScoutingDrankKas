<template>
  <div class="flex items-center justify-center">
    <div
      class="max-w-sm w-full space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <h2
        class="text-xl font-extrabold text-center text-gray-900 dark:text-white"
      >
        Edit Custom Role
      </h2>

      <form @submit.prevent="updateCustomRole" class="space-y-2">
        <div>
          <label class="text-xs" for="roleName">Role Name:</label>
          <input
            id="roleName"
            v-model="roleForm.roleName"
            name="roleName"
            type="text"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter role name"
          />
          <div id="errorRoleName" class="text-red-500 text-sm mt-1"></div>
        </div>

        <div>
          <label class="text-xs" for="roleDescription">Role Description:</label>
          <textarea
            id="roleDescription"
            v-model="roleForm.roleDescription"
            name="roleDescription"
            required
            class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Describe the role's purpose"
            rows="3"
          ></textarea>
          <div
            id="errorRoleDescription"
            class="text-red-500 text-sm mt-1"
          ></div>
        </div>

        <label class="text-xs block mb-2">Role Permissions:</label>
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
              @change="togglePermission(permission)"
              class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
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
          ></div>
        </div>

        <div class="pt-4">
          <button
            type="submit"
            class="group relative w-full flex justify-center py-1 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Role
          </button>
        </div>
      </form>

      <div>
        <NuxtLink
          to="/admin/roles"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Back to Roles
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const availablePermissions = ["admin", "stam", "scouting-lid", "extern"];

const roleForm = ref({
  roleName: "",
  roleDescription: "",
  rolePermissions: [],
});

onMounted(async () => {
  try {
    const route = useRoute();
    const roleId = ref(route.params.id);
    const roleData = await $fetch(`/api/roles/${roleId.value}`, {
      method: "GET",
    });
    roleForm.value = {
      roleName: roleData.roleName,
      roleDescription: roleData.roleDescription,
      rolePermissions: roleData.rolePermissions,
    };
  } catch (error) {
    console.error("Failed to load role data", error);
  }
});

const togglePermission = (permission) => {
  const index = roleForm.value.rolePermissions.indexOf(permission);
  if (index > -1) {
    roleForm.value.rolePermissions.splice(index, 1);
  } else {
    roleForm.value.rolePermissions.push(permission);
  }
};

const updateCustomRole = async () => {
  document.getElementById("errorRoleName").textContent = "";
  document.getElementById("errorRoleDescription").textContent = "";
  document.getElementById("errorRolePermissions").textContent = "";

  let hasError = false;

  if (!roleForm.value.roleName) {
    document.getElementById("errorRoleName").textContent =
      "Role name is required";
    hasError = true;
  }

  if (!roleForm.value.roleDescription) {
    document.getElementById("errorRoleDescription").textContent =
      "Role description is required";
    hasError = true;
  }

  if (roleForm.value.rolePermissions.length === 0) {
    document.getElementById("errorRolePermissions").textContent =
      "Please select at least one permission";
    hasError = true;
  }

  if (hasError) return;

  try {
    const route = useRoute();
    const roleId = ref(route.params.id);
    await $fetch(`/api/admin/roles/update`, {
      method: "POST",
      body: { ...roleForm.value, id: roleId.value },
    });

    navigateTo("/admin/roles");
  } catch (error) {
    console.error("Failed to update role", error);
    document.getElementById("errorRoleName").textContent =
      "Failed to update role";
  }
};
</script>
