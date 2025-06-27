<template>
  <div class="w-full relative">
    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div class="overflow-x-auto">
        <div class="relative">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th 
                  v-for="(column, index) in columns" 
                  :key="index"
                  :class="[
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  ]"
                >
                  {{ column.header }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                    // Add special styling for cells that might contain dropdowns
                    column.field === 'actions' ? 'relative z-20' : ''
                  ]"
                >
                  <div class="relative">
                    <slot :name="`cell-${column.field}`" :row="row" :value="row[column.field]">
                      {{ row[column.field] }}
                    </slot>
                  </div>
                </td>
              </tr>
              <tr v-if="!data || data.length === 0">
                <td :colspan="columns.length" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {{ noDataText || 'No data available' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination" class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t('showing') }} {{ (pagination.page - 1) * pagination.pageSize + 1 }} - 
          {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 
          {{ $t('of') }} {{ pagination.total }}
        </div>
        <div class="flex items-center gap-1">
          <CButton 
            :type="pagination.page > 1 ? 'primary' : 'secondary'"
            :disabled="pagination.page === 1" 
            class="px-2 h-6 text-sm"
            @click="$emit('update:page', pagination.page - 1)"
          >
            {{ $t('prev') }}
          </CButton>
          <span class="px-2 text-sm">{{ pagination.page }}/{{ Math.ceil(pagination.total / pagination.pageSize) }}</span>
          <CButton 
            :type="pagination.page * pagination.pageSize < pagination.total ? 'primary' : 'secondary'"
            :disabled="pagination.page * pagination.pageSize >= pagination.total" 
            class="px-2 h-6 text-sm"
            @click="$emit('update:page', pagination.page + 1)"
          >
            {{ $t('next') }}
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import CButton from '~/components/CButton.vue';

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(col => col.header && col.field);
    }
  },
  data: {
    type: Array,
    default: () => []
  },
  pagination: {
    type: Object,
    default: null,
    validator: (value) => {
      if (!value) return true;
      return 'page' in value && 'pageSize' in value && 'total' in value;
    }
  },
  noDataText: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:page']);
</script>