<template>
  <div class="flex flex-col items-center justify-center">
    <div class="w-full flex flex-col items-center justify-center">
      <div class="max-w-sm w-full mb-2">
        <CTitle :text="$t('roles.editRole')"/>
        <BackLink to="/admin/roles" :backPage="$t('roles.roles')"></BackLink>
      </div>
    </div>
    <div
      class="max-w-sm w-full space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
    >
      <form @submit.prevent="updateCustomRole" class="space-y-2">
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
            class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            :placeholder="$t('roles.enterRoleName')"
          />
          <div id="errorRoleName" class="text-red-500 text-sm mt-1"></div>
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
            class="appearance-none rounded-md relative block w-full px-3 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            :placeholder="$t('roles.enterRoleDescription')"
            rows="3"
          ></textarea>
          <div
            id="errorRoleDescription"
            class="text-red-500 text-sm mt-1"
          ></div>
        </div>

        <label class="text-xs block mb-2">{{ $t("roles.permissions") }}:</label>
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
              {{ $t(`permissions.${permission}`) }}
            </label>
          </div>
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
</template>

<script setup>
import { ref, onMounted } from "vue";

const availablePermissions = ["admin", "stam", "scouting-lid", "extern"];

const roleForm = ref({
  roleName: "",
  roleDescription: "",
  rolePermissions: [],
});

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
    const route = useRoute();
    const roleId = ref(route.params.id);
    await $fetch(`/api/admin/roles/update`, {
      method: "POST",
      body: { ...roleForm.value, id: roleId.value },
    });

    navigateTo("/admin/roles");
  } catch (error) {
    console.error("Failed to update role", error);
    document.getElementById("errorRoleName").textContent = $t(
      "roles.createRoleError"
    );
  }
};
</script>
