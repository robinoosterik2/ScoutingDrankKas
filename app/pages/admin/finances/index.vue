<template>
  <div class="container mx-auto p-4">
    <CTitle :text="$t('admin.financeManagement')" />
    <div class="mb-6">
      <BackLink to="/admin" :back-page="$t('admin.title')" />
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">{{ $t('filters.title') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('filters.month') }}
          </label>
          <select 
            v-model="selectedMonth"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option v-for="(month, index) in months" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('filters.year') }}
          </label>
          <select 
            v-model="selectedYear"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="fetchFinanceData"
            class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ $t('filters.apply') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <SummaryCard 
        :title="$t('finance.totalRevenue')" 
        :value="formatCurrency(summary.totalRevenue)" 
        icon="currency-euro"
        color="indigo"
      />
      <SummaryCard 
        :title="$t('finance.totalOrders')" 
        :value="summary.totalOrders.toString()"
        icon="shopping-bag"
        color="green"
      />
      <SummaryCard 
        :title="$t('finance.averageOrderValue')" 
        :value="formatCurrency(summary.averageOrderValue)"
        icon="chart-bar"
        color="purple"
      />
    </div>

    <!-- Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {{ $t('finance.revenueOverTime') }}
      </h2>
      <div class="h-64">
        <canvas ref="revenueChart"></canvas>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
          {{ $t('finance.recentTransactions') }}
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('finance.date') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('finance.orderId') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('finance.customer') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('finance.amount') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="transaction in transactions" :key="transaction._id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                #{{ transaction._id.toString().substring(18, 24) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transaction.user?.firstName }} {{ transaction.user?.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                {{ formatCurrency(transaction.total) }}
              </td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ $t('finance.noTransactions') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Chart from 'chart.js/auto';
import CTitle from '~/components/CTitle.vue';
import BackLink from '~/components/BackLink.vue';
import SummaryCard from '~/components/SummaryCard.vue';

const { t } = useI18n();

// Data
const months = [
  t('months.january'), t('months.february'), t('months.march'), t('months.april'),
  t('months.may'), t('months.june'), t('months.july'), t('months.august'),
  t('months.september'), t('months.october'), t('months.november'), t('months.december')
];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const summary = ref({
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0
});

const transactions = ref([]);
let revenueChart = null;

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchFinanceData = async () => {
  try {
    // In a real app, you would fetch this data from your API
    // const response = await $fetch(`/api/finance/summary?month=${selectedMonth.value}&year=${selectedYear.value}`);
    // summary.value = response.summary;
    // transactions.value = response.transactions;
    
    // Mock data for demonstration
    summary.value = {
      totalRevenue: 1245.67,
      totalOrders: 42,
      averageOrderValue: 29.66
    };
    
    transactions.value = [
      {
        _id: '60d5ec9f58309f0f8c8e9e8f',
        createdAt: new Date(selectedYear.value, selectedMonth.value - 1, 15).toISOString(),
        user: { firstName: 'John', lastName: 'Doe' },
        total: 12.50
      },
      {
        _id: '60d5ec9f58309f0f8c8e9e90',
        createdAt: new Date(selectedYear.value, selectedMonth.value - 1, 10).toISOString(),
        user: { firstName: 'Jane', lastName: 'Smith' },
        total: 8.75
      },
      // Add more mock data as needed
    ];
    
    updateChart();
  } catch (error) {
    console.error('Error fetching finance data:', error);
  }
};

const updateChart = () => {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  
  // Destroy previous chart instance if it exists
  if (revenueChart) {
    revenueChart.destroy();
  }
  
  // Mock data for the chart
  const labels = Array.from({ length: 30 }, (_, i) => `${i + 1} ${months[selectedMonth.value - 1]}`);
  const data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50);
  
  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('finance.dailyRevenue'),
          data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `€${value}`
          }
        }
      }
    }
  });
};

// Lifecycle hooks
onMounted(() => {
  fetchFinanceData();
});

// Watch for changes in filters
watch([selectedMonth, selectedYear], () => {
  fetchFinanceData();
});
</script>

<style scoped>
/* Add any custom styles here */
</style>