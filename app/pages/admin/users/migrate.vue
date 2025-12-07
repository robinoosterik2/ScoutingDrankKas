<template>
  <div>
    <CTitle :text="$t('users.migrate.title')" />
    <BackLink to="/admin/users" :back-page="$t('users.title')" />

    <div
      class="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow dark:bg-gray-800"
    >
      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            @click="activeTab = 'single'"
            :class="[
              activeTab === 'single'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
          >
            {{ $t("getStarted.singleUser") }}
          </button>
          <button
            @click="activeTab = 'bulk'"
            :class="[
              activeTab === 'bulk'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            ]"
          >
            {{ $t("users.migrate.bulkImport") }}
          </button>
        </nav>
      </div>

      <!-- Single User Form -->
      <div v-if="activeTab === 'single'">
        <form @submit.prevent="submitSingle" class="space-y-6 max-w-lg">
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("login.username") }}</label
            >
            <input
              id="username"
              v-model="singleForm.username"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              for="balance"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >{{ $t("balance") }} (cents)</label
            >
            <input
              id="balance"
              v-model.number="singleForm.balance"
              type="number"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="firstName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >{{ $t("register.firstName") }} (Optional)</label
              >
              <input
                id="firstName"
                v-model="singleForm.firstName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                for="lastName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >{{ $t("register.lastName") }} (Optional)</label
              >
              <input
                id="lastName"
                v-model="singleForm.lastName"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="flex items-center">
            <input
              id="createAnother"
              v-model="createAnother"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              for="createAnother"
              class="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              {{ $t("users.migrate.createAnother") }}
            </label>
          </div>

          <div
            v-if="singleMessage.text"
            :class="
              singleMessage.type === 'error' ? 'text-red-500' : 'text-green-500'
            "
            class="text-sm"
          >
            {{ singleMessage.text }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {{ isLoading ? $t("loading") : $t("users.migrateUser") }}
            </button>
          </div>
        </form>
      </div>

      <!-- Bulk Upload Form -->
      <div v-else>
        <div class="mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {{ $t("users.migrate.csvDescription") }}
          </p>
          <pre
            class="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto text-gray-700 dark:text-gray-300"
          >
username,balance,firstName(optional),lastName(optional)
user1,100
user2,250,John,Doe
# This is a comment
user3,500,,Smith</pre
          >
        </div>

        <div class="mb-4">
          <textarea
            v-model="csvContent"
            rows="10"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
            :placeholder="$t('users.migrate.csvPlaceholder')"
          ></textarea>
        </div>

        <!-- Preview Table -->
        <div v-if="parsedUsers.length > 0" class="mb-6">
          <h3 class="text-md font-medium text-gray-900 dark:text-white mb-2">
            {{ $t("preview") }} ({{ parsedUsers.length }} users)
          </h3>
          <div class="overflow-x-auto border rounded-md dark:border-gray-700">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {{ $t("login.username") }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {{ $t("balance") }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {{ $t("register.firstName") }}
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                  >
                    {{ $t("register.lastName") }}
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700"
              >
                <tr v-for="(user, idx) in parsedUsers" :key="idx">
                  <td
                    class="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ user.username }}
                  </td>
                  <td
                    class="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                  >
                    {{ user.balance }}
                  </td>
                  <td
                    class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ user.firstName || "-" }}
                  </td>
                  <td
                    class="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                  >
                    {{ user.lastName || "-" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="bulkMessage.text"
          :class="
            bulkMessage.type === 'error' ? 'text-red-500' : 'text-green-500'
          "
          class="mb-4 text-sm whitespace-pre-line"
        >
          {{ bulkMessage.text }}
        </div>

        <div class="flex justify-end">
          <button
            @click="submitBulk"
            :disabled="parsedUsers.length === 0 || isLoading"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ isLoading ? $t("loading") : $t("users.migrate.importUsers") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const activeTab = ref("single");
const splitTab = ref("single");
const singleForm = ref({
  username: "",
  balance: 0,
  firstName: "",
  lastName: "",
});
const createAnother = ref(true);
const singleMessage = ref({ text: "", type: "" });
const isLoading = ref(false);

const csvContent = ref("");
const bulkMessage = ref({ text: "", type: "" });

// Single User Submission
const submitSingle = async () => {
  isLoading.value = true;
  singleMessage.value = { text: "", type: "" };

  try {
    await $fetch("/api/admin/migrate/user", {
      method: "POST",
      body: singleForm.value,
    });
    singleMessage.value = {
      text: t("users.migrate.successSingle"),
      type: "success",
    };
    if (createAnother.value) {
      singleForm.value = {
        username: "",
        balance: 0,
        firstName: "",
        lastName: "",
      };
      setTimeout(() => {
        singleMessage.value = { text: "", type: "" };
      }, 3000);
    } else {
      navigateTo("/admin/users");
    }
  } catch (e) {
    singleMessage.value = {
      text: e.response?._data?.message || t("error"),
      type: "error",
    };
  } finally {
    isLoading.value = false;
  }
};

// CSV Parsing
const parsedUsers = computed(() => {
  if (!csvContent.value) return [];

  const lines = csvContent.value.split("\n");
  const users = [];

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith("username,")) continue;

    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 2) continue; // Need at least username and balance

    const [username, balanceStr, firstName, lastName] = parts;
    const balance = parseInt(balanceStr, 10);

    if (username && !isNaN(balance)) {
      users.push({
        username,
        balance,
        firstName: firstName || null,
        lastName: lastName || null,
      });
    }
  }
  return users;
});

// Bulk Submission
const submitBulk = async () => {
  if (parsedUsers.value.length === 0) return;

  isLoading.value = true;
  bulkMessage.value = { text: "", type: "" };

  try {
    const result = await $fetch("/api/admin/migrate/bulk", {
      method: "POST",
      body: { users: parsedUsers.value },
    });

    let msg = "";
    if (result.success.length > 0) {
      msg +=
        t("users.migrate.bulkSuccess", { count: result.success.length }) + "\n";
    }
    if (result.failed.length > 0) {
      msg +=
        t("users.migrate.bulkFailed", { count: result.failed.length }) + ":\n";
      result.failed.forEach((f) => {
        msg += `- ${f.username}: ${f.reason}\n`;
      });
      bulkMessage.value = { text: msg, type: "error" }; // Use error style if any failed
    } else {
      bulkMessage.value = { text: msg, type: "success" };
    }
  } catch (e) {
    bulkMessage.value = {
      text: e.response?._data?.message || t("error"),
      type: "error",
    };
  } finally {
    isLoading.value = false;
  }
};
</script>
