<template>
  <div>
    <CTitle :text="$t('users.activateTitle')" />
    <BackLink to="/admin/users" :back-page="$t('users.title')" />

    <div
      v-if="user"
      class="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow dark:bg-gray-800"
    >
      <div class="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("login.username") }}</label
          >
          <div class="mt-1 text-sm text-gray-900 dark:text-white">
            {{ user.username }}
          </div>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("balance") }}</label
          >
          <div class="mt-1 text-sm text-gray-900 dark:text-white">
            {{ format(user.balance) }}
          </div>
        </div>
      </div>

      <form @submit.prevent="activateUser" class="space-y-6">
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("register.email") }}</label
          >
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label
            for="role"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("role") }}</label
          >
          <select
            id="role"
            v-model="form.roleId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"
          >
            <option :value="null">
              {{ $t("roles.selectRole") || "Select a Role" }}
            </option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.roleName }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="firstName"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("register.firstName") }}</label
            >
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              for="lastName"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("register.lastName") }}</label
            >
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("register.password") }}</label
          >
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="8"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label
            for="confirmPassword"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >{{ $t("register.confirmPassword") }}</label
          >
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
            {{ $t("register.errors.passwordsDoNotMatch") }}
          </p>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isLoading || passwordMismatch"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isLoading ? $t("loading") : $t("users.activate") }}
          </button>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm mt-2">
          {{ errorMessage }}
        </div>
      </form>
    </div>
    <div v-else-if="pending" class="text-center py-12">
      {{ $t("loading") }}
    </div>
    <div v-else class="text-center py-12 text-red-500">
      {{ $t("login.errors.userNotFound") }}
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const userId = route.params.id;
const { t } = useI18n();
const { format } = useMoney();

const form = ref({
  firstName: "",
  lastName: "",
  password: "",
  confirmPassword: "",
  roleId: null,
});

const roles = ref([]);

const errorMessage = ref("");
const isLoading = ref(false);

const { data: user, pending } = await useFetch(`/api/users/${userId}`);

try {
  roles.value = await $fetch("/api/roles/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch roles:", error);
}

const passwordMismatch = computed(() => {
  return (
    form.value.password &&
    form.value.confirmPassword &&
    form.value.password !== form.value.confirmPassword
  );
});

const activateUser = async () => {
  if (passwordMismatch.value) return;
  isLoading.value = true;
  errorMessage.value = "";

  try {
    await $fetch(`/api/admin/users/${userId}/activate`, {
      method: "POST",
      body: form.value,
    });
    navigateTo("/admin/users");
  } catch (e) {
    console.error(e);
    errorMessage.value =
      e.response?._data?.message || t("register.errors.registrationFailed");
  } finally {
    isLoading.value = false;
  }
};

watchEffect(() => {
  if (user.value) {
    if (user.value.firstName) form.value.firstName = user.value.firstName;
    if (user.value.lastName) form.value.lastName = user.value.lastName;
    if (user.value.email) form.value.email = user.value.email;
    if (user.value.role) form.value.roleId = user.value.role.id;
  }
});
</script>
