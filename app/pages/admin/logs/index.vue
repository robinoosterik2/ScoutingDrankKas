<template>
  <CTitle :text="$t('logs.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')" />
  </div>

  <!-- Filters and Sorting -->
  <div class="mb-4 flex space-x-4">
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
    <select
      v-model="selectedAction"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
    >
      <option value="">{{ $t("all") }}</option>
      <option v-for="description in descriptions" :key="description" :value="description">
        {{ description }}
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
    class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      @click="toggleSortDirection"
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
            {{ $t("description") }}
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
          v-for="log in paginatedLogs"
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
              {{ log.description }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ log.objectType }}
            </div>
          </td>
          <td class="px-6 py-2">
            <div class="text-sm text-gray-500 dark:text-gray-300">
                {{ new Date(log.createdAt).toLocaleString('nl-nl', { hour12: false }) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Pagination -->
    <div v-if="filteredAndSortedLogs.length > 0" class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('pagination.showing') }} 
          <span class="font-medium">{{ Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedLogs.length) }}</span>
          {{ $t('pagination.to') }} 
          <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredAndSortedLogs.length) }}</span>
          {{ $t('pagination.of') }} 
          <span class="font-medium">{{ filteredAndSortedLogs.length }}</span>
          {{ $t('pagination.entries') }}
        </div>
        <div class="flex space-x-1">
          <button 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(1)" 
          >
            &laquo;
          </button>
          <button 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(currentPage - 1)" 
          >
            &lsaquo;
          </button>
          <template v-for="page in Math.min(5, totalPages)" :key="page">
            <button 
              :class="{
                'bg-indigo-600 text-white': currentPage === page,
                'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600': currentPage !== page
              }"
              class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium"
              @click="goToPage(page)" 
            >
              {{ page }}
            </button>
          </template>
          <template v-if="totalPages > 5">
            <span class="px-2 py-1">...</span>
            <button 
              :class="{
                'bg-indigo-600 text-white': currentPage === totalPages,
                'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600': currentPage !== totalPages
              }"
              class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium"
              @click="goToPage(totalPages)" 
            >
              {{ totalPages }}
            </button>
          </template>
          <button 
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="goToPage(currentPage + 1)" 
          >
            &rsaquo;
          </button>
        </div>
      </div>
    </div>
    
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
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BackLink from '@/components/BackLink.vue';
import CTitle from '@/components/CTitle.vue';

const descriptions = ref([]);
const logs = ref([]);
const searchQuery = ref("");
const selectedAction = ref("");
const sortBy = ref("timestamp");
const sortDirection = ref("desc");
const { t: _t } = useI18n();

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed properties for pagination
const totalPages = computed(() => Math.ceil(filteredAndSortedLogs.value.length / itemsPerPage.value));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredAndSortedLogs.value.slice(start, end);
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Reset to first page when filters change
watch([searchQuery, selectedAction, sortBy, sortDirection], () => {
  currentPage.value = 1;
});

try {
  logs.value = await $fetch("/api/admin/log/all", { method: "GET" });
  for (const log of logs.value) {
    const action = log.action;
    if (!descriptions.value.includes(action)) {
      descriptions.value.push(action);
    }
  }
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