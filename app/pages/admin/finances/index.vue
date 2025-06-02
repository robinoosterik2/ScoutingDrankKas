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
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        :title="$t('finance.totalRaised')" 
        :value="formatCurrency(summary.totalRaised)"
        icon="hand-holding-usd"
        color="yellow"
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
        <canvas id="revenueChart"></canvas>
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
                {{ $t('finance.type') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {{ $t('finance.reference') }}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                {{ transaction.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ transaction.type === 'order' ? '#' + (transaction._id?.toString().substring(18, 24) || '') : 'Donation' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ transaction.user?.firstName }} {{ transaction.user?.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                {{ formatCurrency(transaction.displayAmount) }}
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
  totalRaised: 0,
  averageOrderValue: 0
});

const transactions = ref([]);
const orders = ref([]);
const raises = ref([]);
let revenueChart = null;

// // Methods
// const updateChart = () => {
//   if (revenueChart) {
//     revenueChart.destroy();
//   }
  
//   const ctx = document.getElementById('revenueChart');
//   if (!ctx) return;
  
//   const labels = [];
//   const salesData = [];
//   const raiseData = [];
  
//   // Group data by day
//   const dailyData = {};
  
//   // Process orders
//   orders.value.forEach(order => {
//     const date = new Date(order.createdAt).toLocaleDateString();
//     if (!dailyData[date]) {
//       dailyData[date] = { sales: 0, raises: 0 };
//     }
//     dailyData[date].sales += order.total || 0;
//   });
  
//   // Process raises
//   raises.value.forEach(raise => {
//     const date = new Date(raise.createdAt).toLocaleDateString();
//     if (!dailyData[date]) {
//       dailyData[date] = { sales: 0, raises: 0 };
//     }
//     dailyData[date].raises += raise.amount || 0;
//   });
  
//   // Sort dates and prepare data for chart
//   Object.entries(dailyData)
//     .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
//     .forEach(([date, data]) => {
//       labels.push(date);
//       salesData.push(data.sales);
//       raiseData.push(data.raises);
//     });
  
//   revenueChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//       labels,
//       datasets: [
//         {
//           label: 'Sales',
//           data: salesData,
//           backgroundColor: 'rgba(79, 70, 229, 0.8)',
//           borderColor: 'rgba(79, 70, 229, 1)',
//           borderWidth: 1
//         },
//         {
//           label: 'Donations',
//           data: raiseData,
//           backgroundColor: 'rgba(234, 179, 8, 0.8)',
//           borderColor: 'rgba(234, 179, 8, 1)',
//           borderWidth: 1
//         }
//       ]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       scales: {
//         y: {
//           beginAtZero: true,
//           ticks: {
//             callback: (value) => `€${value}`
//           }
//         }
//       },
//       plugins: {
//         tooltip: {
//           callbacks: {
//             label: (context) => {
//               return `${context.dataset.label}: €${context.raw.toFixed(2)}`;
//             }
//           }
//         }
//       }
//     }
//   });
// };

const formatCurrency = (value) => {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchFinanceData = async () => {
  try {
    const response = await $fetch(`/api/admin/finances/get?month=${selectedMonth.value}&year=${selectedYear.value}`);
    console.log(response);
    console.log(response.totalSales);
    console.log(response.totalRaised);
    // Process orders
    orders.value = response.orders || [];
    const totalSales = response.totalSales || 0;

    const salesPerDay = response.salesPerDay;
    
    // Process raises
    raises.value = response.raises || [];
    const totalRaised = response.totalRaised || 0;
    
    // Update summary
    summary.value = {
      totalRevenue: totalSales + totalRaised,
      totalOrders: orders.value.length,
      totalRaised: totalRaised,
      averageOrderValue: orders.value.length > 0 ? totalSales / orders.value.length : 0,
      salesPerDay: salesPerDay
    };
    
    // Combine orders and raises for transactions list
    const orderTransactions = orders.value.map(order => ({
      ...order,
      type: 'order',
      displayAmount: order.total,
      user: order.user || { firstName: 'Guest', lastName: '' }
    }));
    
    const raiseTransactions = raises.value.map(raise => ({
      ...raise,
      type: 'raise',
      displayAmount: raise.amount,
      user: raise.user || { firstName: 'Donor', lastName: '' }
    }));
    
    // Sort transactions by date
    transactions.value = [...orderTransactions, ...raiseTransactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
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
  
  const labels = Array.from({ length: 30 }, (_, i) => `${i + 1} ${months[selectedMonth.value - 1]}`);
  // data should be the amount sold per day
  const data = summary.value.salesPerDay.value
  console.log(data)
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