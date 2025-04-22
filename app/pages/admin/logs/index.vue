<template>
  <CTitle :text="$t('logs.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :backPage="$t('admin.title')"></BackLink>
  </div>

  <!-- Filters and Sorting -->
  <div class="mb-4 flex space-x-4">
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    />
    <select
      v-model="selectedAction"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
    >
      <option value="">{{ $t("all") }}</option>
      <option v-for="action in actions" :key="action" :value="action">
        {{ action }}
      </option>
    </select>
    <select
      v-model="sortBy"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
      <option value="executor">{{ $t("sortBy") }} {{ $t("executor") }}</option>
      <option value="action">{{ $t("sortBy") }} {{ $t("action") }}</option>
      <option value="timestamp">{{ $t("sortBy") }} {{ $t("timestamp") }}</option>
    </select>
    <button
      @click="toggleSortDirection"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
      {{ sortDirection === "asc" ? "▲" : "▼" }}
    </button>
  </div>

  <!-- Logs Table -->
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-visible">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr class="overflow-visible">
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("executor") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("action") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("object") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("timestamp") }}
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="log in filteredAndSortedLogs"
          :key="log.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 overflow-visible relative"
        >
          <td class="px-6 py-2 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ log.executor.username }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ log.action }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ log.object }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
                {{ new Date(log.createdAt) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Empty State -->
    <div
      v-if="filteredAndSortedLogs.length === 0"
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
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t("logs.noLogs") }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t("logs.getStarted") }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BackLink from '@/components/BackLink.vue';
import CTitle from '@/components/CTitle.vue';

const actions = ["Create", "Update", "Delete", "Sold", "Raise"];
const logs = ref([]);
const searchQuery = ref("");
const selectedAction = ref("");
const sortBy = ref("timestamp");
const sortDirection = ref("desc");
const { t } = useI18n();

try {
  logs.value = await $fetch("/api/admin/log/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch logs:", error);
}

const filteredAndSortedLogs = computed(() => {
  return logs.value
    .filter((log) => {
      const matchesSearch =
        log.executor.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesAction =
        !selectedAction.value ||
        log.action === selectedAction.value;
      return matchesSearch && matchesAction;
    })
    .sort((a, b) => {
      const direction = sortDirection.value === "asc" ? 1 : -1;
      if (sortBy.value === "executor") {
        return a.executor.username.localeCompare(b.executor.username) * direction;
      } else if (sortBy.value === "action") {
        return a.action.localeCompare(b.action) * direction;
      } else if (sortBy.value === "timestamp") {
        return (new Date(a.createdAt) - new Date(b.createdAt)) * direction;
      }
      return 0;
    });
});

// Toggle sort direction
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};
</script>