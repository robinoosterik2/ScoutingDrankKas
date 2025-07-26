<template>
  <div class="container mx-auto p-4">
    <CTitle :text="$t('admin.financeManagement')" />
    <div class="mb-6">
      <BackLink to="/admin" :back-page="$t('admin.title')" />
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {{ $t("filters.title") }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ $t("filters.year") }}
          </label>
          <select
            v-model="selectedYear"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ $t("filters.month") }}
          </label>
          <select
            v-model="selectedMonth"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1 px-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option :value="null">{{ $t("filters.allMonths") }}</option>
            <option
              v-for="month in months"
              :key="month.value"
              :value="month.value"
            >
              {{ month.label }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            @click="fetchFinanceData"
          >
            {{ $t("filters.apply") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <SummaryCard
        :key="`revenue-${summary.totalRevenue}`"
        :title="$t('finance.totalRevenue')"
        :value="summary.totalRevenue"
        icon="currency-euro"
        color="indigo"
        value-type="currency"
        :tooltip="$t('finance.totalRevenueTooltip')"
      />
      <SummaryCard
        :key="`orders-${summary.totalOrders}`"
        :title="$t('finance.totalOrders')"
        :value="summary.totalOrders"
        icon="shopping-bag"
        color="green"
        value-type="number"
        :tooltip="$t('finance.totalOrdersTooltip')"
      />
      <SummaryCard
        :key="`raised-${summary.totalRaised}`"
        :title="$t('finance.totalRaised')"
        :value="summary.totalRaised"
        icon="hand-holding-usd"
        color="yellow"
        value-type="currency"
        :tooltip="$t('finance.totalRaisedTooltip')"
      />
      <SummaryCard
        :key="`purchases-${summary.totalPurchases}`"
        :title="$t('finance.totalPurchases')"
        :value="summary.totalPurchases"
        icon="shopping-cart"
        color="red"
        value-type="currency"
        :tooltip="$t('finance.totalPurchasesTooltip')"
      />
      <SummaryCard
        :key="`net-${summary.netRevenue}`"
        :title="$t('finance.netRevenue')"
        :value="summary.netRevenue"
        icon="chart-line"
        color="purple"
        value-type="currency"
        :tooltip="$t('finance.netRevenueTooltip')"
      />
    </div>

    <!-- Chart -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {{ $t("finance.revenueOverTime") }}
      </h2>
      <div class="h-64">
        <canvas id="revenueChart" />
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
          {{ $t("finance.recentTransactions") }}
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {{ $t("finance.date") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {{ $t("finance.type") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {{ $t("finance.actionBy") }}
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {{ $t("finance.affectedUser") }}
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {{ $t("finance.amount") }}
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
          >
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction._id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
              >
                {{ formatDate(transaction.createdAt) }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize"
              >
                {{ transaction.type }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
              >
                {{ transaction.user?.firstName }}
                {{ transaction.user?.lastName }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
              >
                {{ transaction.affectedUser?.firstName }}
                {{ transaction.affectedUser?.lastName }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white"
              >
                {{ format(transaction.displayAmount) }}
              </td>
            </tr>
            <tr v-if="transactions.length === 0">
              <td
                colspan="5"
                class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                {{ $t("finance.noTransactions") }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-white dark:bg-gray-800">
            <tr>
              <td
                colspan="5"
                class="px-6 py-3 border-t border-gray-200 dark:border-gray-700"
              >
                <div class="flex items-center justify-between">
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t("pagination.showing") }}
                    <span class="font-medium">{{
                      Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        transactions.length
                      )
                    }}</span>
                    {{ $t("pagination.to") }}
                    <span class="font-medium">{{
                      Math.min(currentPage * itemsPerPage, transactions.length)
                    }}</span>
                    {{ $t("pagination.of") }}
                    <span class="font-medium">{{ transactions.length }}</span>
                    {{ $t("pagination.entries") }}
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
                    <template
                      v-for="page in Math.min(5, totalPages)"
                      :key="page"
                    >
                      <button
                        :class="{
                          'bg-indigo-600 text-white': currentPage === page,
                          'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600':
                            currentPage !== page,
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
                          'bg-indigo-600 text-white':
                            currentPage === totalPages,
                          'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600':
                            currentPage !== totalPages,
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
                    <button
                      :disabled="currentPage === totalPages"
                      class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="goToPage(totalPages)"
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";
import CTitle from "~/components/CTitle.vue";
import BackLink from "~/components/BackLink.vue";
import SummaryCard from "~/components/SummaryCard.vue";

const { format } = useMoney();
const { t } = useI18n();

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);

// Computed properties
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return transactions.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(transactions.value.length / itemsPerPage);
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

// Data
const months = [
  { value: 1, label: t("months.january") },
  { value: 2, label: t("months.february") },
  { value: 3, label: t("months.march") },
  { value: 4, label: t("months.april") },
  { value: 5, label: t("months.may") },
  { value: 6, label: t("months.june") },
  { value: 7, label: t("months.july") },
  { value: 8, label: t("months.august") },
  { value: 9, label: t("months.september") },
  { value: 10, label: t("months.october") },
  { value: 11, label: t("months.november") },
  { value: 12, label: t("months.december") },
];
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const selectedMonth = ref(null); // null means all months
const selectedYear = ref(new Date().getFullYear());

const summary = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalRaised: 0,
  totalPurchases: 0,
  netRevenue: 0,
  averageOrderValue: 0,
});

const transactions = ref([]);
const orders = ref([]);
const raises = ref([]);
let revenueChart = null;
const isLoading = ref(true);

const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const fetchFinanceData = async () => {
  try {
    isLoading.value = true;
    // Build query parameters object
    const params = new URLSearchParams();
    if (selectedMonth.value) params.append("month", selectedMonth.value);
    if (selectedYear.value) params.append("year", selectedYear.value);

    const response = await $fetch(
      `/api/admin/finances/get?${params.toString()}`
    );

    console.log("API Response:", response);

    // Process orders
    orders.value = (response.orders || []).map((order) => ({
      ...order,
      type: "order",
      displayAmount: order.total,
      affectedUser: order.affectedUser,
    }));

    // Process raises
    raises.value = (response.raises || []).map((raise) => ({
      ...raise,
      type: "raise",
      displayAmount: raise.amount,
      affectedUser: raise.affectedUser,
    }));

    // Update summary with data from backend
    summary.value = {
      totalRevenue: response.summary?.totalRevenue || 0,
      totalOrders: response.summary?.totalOrders || 0,
      totalRaised: response.summary?.totalRaised || 0,
      totalPurchases: response.summary?.totalPurchases || 0,
      netRevenue: response.summary?.netRevenue || 0,
      averageOrderValue: response.summary?.averageOrderValue || 0,
      salesPerDay: response.salesPerDay || [],
      raisesPerDay: response.raisesPerDay || [],
      purchasesPerDay: response.purchasesPerDay || [],
    };
    console.log("Summary data:", summary.value);

    // Combine orders and raises for transactions list
    const orderTransactions = orders.value.map((order) => ({
      ...order,
      type: "order",
      displayAmount: order.total,
      user: order.user,
    }));

    const raiseTransactions = raises.value.map((raise) => ({
      ...raise,
      type: "raise",
      displayAmount: raise.amount,
      user: raise.user,
    }));

    // Sort transactions by date
    transactions.value = [...orderTransactions, ...raiseTransactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log("Summary data:", summary.value);

    updateChart();
  } catch (error) {
    console.error("Error fetching finance data:", error);
  } finally {
    isLoading.value = false;
  }
};

const updateChart = () => {
  const ctx = document.getElementById("revenueChart");
  if (!ctx) return;

  // Destroy previous chart instance if it exists
  if (revenueChart) {
    revenueChart.destroy();
  }

  // Get data from the response
  const salesData = summary.value.salesPerDay || [];
  const raisesData = summary.value.raisesPerDay || [];
  const purchasesData = summary.value.purchasesPerDay || [];

  // Prepare labels and data based on whether we're viewing a month or all months
  let labels, salesChartData, raisesChartData, purchasesChartData;

  if (selectedMonth.value) {
    // Daily view for a specific month
    const daysInMonth = new Date(
      selectedYear.value,
      selectedMonth.value,
      0
    ).getDate();
    labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
    salesChartData = Array(daysInMonth).fill(0);
    raisesChartData = Array(daysInMonth).fill(0);
    purchasesChartData = Array(daysInMonth).fill(0);

    // Fill in the actual data for daily view
    salesData.forEach((item) => {
      const day = new Date(item.date).getDate();
      salesChartData[day - 1] = item.total;
    });

    raisesData.forEach((item) => {
      const day = new Date(item.date).getDate();
      raisesChartData[day - 1] = item.total;
    });

    purchasesData.forEach((item) => {
      const day = new Date(item.date).getDate();
      purchasesChartData[day - 1] = item.total;
    });
  } else {
    // Monthly view for the selected year
    labels = months.map((m) => m.label);
    salesChartData = Array(12).fill(0);
    raisesChartData = Array(12).fill(0);
    purchasesChartData = Array(12).fill(0);

    // Fill in the actual data for monthly view
    salesData.forEach((item) => {
      const month = new Date(item.date).getMonth();
      salesChartData[month] = (salesChartData[month] || 0) + item.total;
    });

    raisesData.forEach((item) => {
      const month = new Date(item.date).getMonth();
      raisesChartData[month] = (raisesChartData[month] || 0) + item.total;
    });

    purchasesData.forEach((item) => {
      const month = new Date(item.date).getMonth();
      purchasesChartData[month] = (purchasesChartData[month] || 0) + item.total;
    });
  }

  // Register the datalabels plugin
  Chart.register(ChartDataLabels);

  revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("finance.sales") || "Sales",
          data: salesChartData,
          borderColor: "rgb(79, 70, 229)",
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(79, 70, 229)",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(79, 70, 229)",
          pointHoverBorderColor: "#fff",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: t("finance.raises") || "Raises",
          data: raisesChartData,
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(245, 158, 11)",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(245, 158, 11)",
          pointHoverBorderColor: "#fff",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: t("finance.purchases") || "Purchases",
          data: purchasesChartData,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "rgb(239, 68, 68)",
          pointBorderColor: "#fff",
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgb(239, 68, 68)",
          pointHoverBorderColor: "#fff",
          pointHitRadius: 10,
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${format(context.parsed.y)}`;
            },
          },
        },
        datalabels: {
          display: (context) => {
            // Only show label if value is greater than 0
            return context.dataset.data[context.dataIndex] > 0;
          },
          color: "#4B5563",
          anchor: "end",
          align: "top",
          offset: 8,
          formatter: (value) => format(value),
          font: {
            size: 10,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => format(value),
          },
          // Add padding at the top of the y-axis
          afterFit: function (scale) {
            scale.paddingTop = 20; // Add 20px padding at the top
          },
          // Add a buffer to the max value to ensure labels fit
          afterDataLimits: function (scale) {
            const max = Math.max(
              ...salesChartData,
              ...raisesChartData,
              ...purchasesChartData
            );
            scale.max = max * 1.15; // Add 15% buffer to the max value
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
};

// Lifecycle hooks
onMounted(() => {
  fetchFinanceData();
});

// Watch for filter changes
watch([selectedMonth, selectedYear], () => {
  currentPage.value = 1; // Reset to first page when filters change
  fetchFinanceData();
});
</script>
