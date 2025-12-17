<template>
  <div class="w-full relative">
    <!-- Table Container which might be scrollable -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div
        class="overflow-x-auto"
        :class="{ 'overflow-y-auto': scrollable }"
        :style="scrollable ? { maxHeight: maxHeight } : {}"
      >
        <div class="relative">
          <table
            class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
          >
            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th
                  v-for="(column, index) in columns"
                  :key="index"
                  :class="[
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.sortable
                      ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'
                      : '',
                  ]"
                  :style="{ width: column.width || 'auto' }"
                  @click="column.sortable ? sortColumn(column.field) : null"
                >
                  <div class="flex items-center justify-between">
                    <span>{{ column.header }}</span>
                    <span
                      v-if="column.sortable"
                      class="ml-1 flex flex-col text-xs opacity-60"
                    >
                      <span
                        :class="[
                          'transition-opacity',
                          currentSortField === column.field &&
                          currentSortDirection === 'desc'
                            ? 'opacity-100 text-blue-500'
                            : 'opacity-40',
                        ]"
                        >▲</span
                      >
                      <span
                        :class="[
                          'transition-opacity -mt-1',
                          currentSortField === column.field &&
                          currentSortDirection === 'asc'
                            ? 'opacity-100 text-blue-500'
                            : 'opacity-40',
                        ]"
                        >▼</span
                      >
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody
              class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
            >
              <tr
                v-for="(row, rowIndex) in data"
                :key="rowIndex"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              >
                <td
                  v-for="(column, colIndex) in columns"
                  :key="colIndex"
                  :class="[
                    'px-6 py-2 whitespace-nowrap',
                    column.align === 'right' ? 'text-right' : 'text-left',
                    column.class,
                  ]"
                >
                  <slot
                    :name="`cell-${column.field}`"
                    :row="row"
                    :value="row[column.field]"
                  >
                    {{ row[column.field] }}
                  </slot>
                </td>
              </tr>
              <tr v-if="!data || data.length === 0">
                <td
                  :colspan="columns.length"
                  class="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  <slot name="empty">
                    {{ noDataText || "No data available" }}
                  </slot>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination (Fixed at bottom if scrollable) -->
      <div
        v-if="pagination"
        class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-lg z-20"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t("showing") }}
          {{ (pagination.page - 1) * pagination.pageSize + 1 }} -
          {{
            Math.min(pagination.page * pagination.pageSize, pagination.total)
          }}
          {{ $t("of") }} {{ pagination.total }}
        </div>
        <div class="flex items-center gap-1">
          <CButton
            :type="pagination.page > 1 ? 'primary' : 'secondary'"
            :disabled="pagination.page === 1"
            class="px-2 h-6 text-sm"
            @click="$emit('update:page', pagination.page - 1)"
          >
            {{ $t("prev") }}
          </CButton>
          <span class="px-2 text-sm"
            >{{ pagination.page }}/{{
              Math.ceil(pagination.total / pagination.pageSize)
            }}</span
          >
          <CButton
            :type="
              pagination.page * pagination.pageSize < pagination.total
                ? 'primary'
                : 'secondary'
            "
            :disabled="
              pagination.page * pagination.pageSize >= pagination.total
            "
            class="px-2 h-6 text-sm"
            @click="$emit('update:page', pagination.page + 1)"
          >
            {{ $t("next") }}
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, computed } from "vue";
import CButton from "~/components/CButton.vue";

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((col) => col.header && col.field);
    },
  },
  data: {
    type: Array,
    default: () => [],
  },
  pagination: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true;
      return "page" in value && "pageSize" in value && "total" in value;
    },
  },
  noDataText: {
    type: String,
    default: "",
  },
  sortField: {
    type: String,
    default: "",
  },
  sortDirection: {
    type: String,
    default: "asc",
    validator: (value) => ["asc", "desc"].includes(value),
  },
  scrollable: {
    type: Boolean,
    default: false,
  },
  maxHeight: {
    type: String,
    default: "70vh",
  },
});

const emit = defineEmits(["update:page", "sort"]);

const currentSortField = computed(() => props.sortField);
const currentSortDirection = computed(() => props.sortDirection);

const sortColumn = (field) => {
  let newDirection = "asc";

  // If clicking the same field, toggle direction
  if (currentSortField.value === field) {
    newDirection = currentSortDirection.value === "asc" ? "desc" : "asc";
  }

  emit("sort", { field, direction: newDirection });
};
</script>

<style scoped>
/* Removed overrides that prevented scrolling */
</style>
