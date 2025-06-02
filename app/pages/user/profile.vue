<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Order Popup -->
    <OrderPopUp
      :is-open="isOrderPopupOpen"
      :order-id="selectedOrderId"
      @close="closeOrderPopup"
    />
    <h1 class="text-3xl font-bold mb-6">{{ $t('profile.title') }}</h1>

    <!-- User Info -->
    <div class="dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <h2 class="text-xl font-semibold mb-2">{{ $t('profile.accountInfo') }}</h2>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
        <span class="font-medium">{{ $t('username') }}:</span>
        <span>{{ user?.username }}</span>
        <span class="font-medium">{{ $t('email') }}:</span>
        <span>{{ user?.email }}</span>
        <span class="font-medium">{{ $t('balance') }}:</span>
        <span :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">€{{ balance }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="activeTab === 'orders' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'"
            @click="activeTab = 'orders'"
          >
            {{ $t('orders') }}
            <span v-if="activeTab === 'orders'" class="hidden md:inline-block ml-2 py-0.5 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              {{ monthlyOrders.length }}
            </span>
          </button>
          <button
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="activeTab === 'raises' 
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'"
            @click="activeTab = 'raises'"
          >
            {{ $t('raises') }}
            <span v-if="activeTab === 'raises'" class="hidden md:inline-block ml-2 py-0.5 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium">
              {{ raises.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Orders Tab -->
    <div v-if="activeTab === 'orders'" class="dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <!-- Filters -->
      <div class="flex items-center gap-4 mb-4 flex-wrap">
        <select
          v-model="selectedMonth"
          @change="handleFilterChange"
          class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
        >
          <option value="">{{ $t('profile.selectMonth') }}</option>
          <option
            v-for="month in monthOptions"
            :key="month.value"
            :value="month.value"
          >
            {{ month.label }}
          </option>
        </select>

        <select
          v-model="selectedYear"
          @change="handleFilterChange"
          class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
        >
          <option value="">{{ $t('profile.selectYear') }}</option>
          <option
            v-for="year in yearOptions"
            :key="year.value"
            :value="year.value"
          >
            {{ year.label }}
          </option>
        </select>
      </div>

      <DataTable
        :columns="[
          { header: $t('date'), field: 'createdAt', align: 'left' },
          { header: $t('barkeeper'), field: 'bartender', align: 'left' },
          { header: $t('total'), field: 'total', align: 'left' },
          { header: $t('actions'), field: 'actions', align: 'right' },
        ]"
        :data="monthlyOrders.map(order => ({
          ...order,
          bartender: order.bartender.username,
          total: `€${order.total}`,
          createdAt: formatDate(order.createdAt),
          actions: ''
        }))"
        :pagination="{
          page: ordersPage,
          pageSize: ordersPageSize,
          total: ordersTotal
        }"
        :no-data-text="$t('profile.noOrders')"
        @update:page="(page) => { ordersPage = page; fetchOrders(); }"
      >
        <template #cell-actions="{ row: order }">
          <button 
            @click="openOrderPopup(order._id)" 
            class="px-3 py-1 rounded bg-blue-500 text-white text-sm"
          >
            {{ $t('profile.viewOrder') }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Raises Tab -->
    <div v-else-if="activeTab === 'raises'" class="dark:bg-gray-800 shadow-md rounded-lg p-4">
      <h2 class="text-xl font-semibold mb-4">{{ $t('profile.raises') }}</h2>
      
      <DataTable
        :columns="[
          { header: $t('date'), field: 'createdAt', align: 'left' },
          { header: $t('raisedBy'), field: 'raiser', align: 'left' },
          { header: $t('Amount'), field: 'amount', align: 'right' },
        ]"
        :data="raises.map(raise => ({
          ...raise,
          raiser: `${raise.raiser.firstName} ${raise.raiser.lastName}`,
          amount: `€${raise.amount.toFixed(2)}`,
          createdAt: formatDate(raise.createdAt)
        }))"
        :pagination="{
          page: raisesPage,
          pageSize: raisesPageSize,
          total: raisesTotal
        }"
        :no-data-text="$t('profile.noRaisesFound')"
        @update:page="(page) => { raisesPage = page; fetchRaises(); }"
      />
    </div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CButton from '~/components/CButton.vue';
import DataTable from '~/components/DataTable.vue'; // Import the new DataTable component

const { user } = useUserSession();

const activeTab = ref('orders');
const monthlyOrders = ref([]);
const orderHistory = ref([]);
const raises = ref([]);

// Pagination state for Orders
const ordersPage = ref(1);
const ordersPageSize = ref(10);
const ordersTotal = ref(0);

// Pagination state for Raises
const raisesPage = ref(1);
const raisesPageSize = ref(10);
const raisesTotal = ref(0);
const balance = ref(0);
const selectedOrderId = ref(null);
const isOrderPopupOpen = ref(false);

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: i + 1
  }));
});

const yearOptions = computed(() => {
  const years = orderHistory.value.map(h => h.year);
  return [...new Set(years)].sort((a, b) => b - a).map(y => ({
    value: y,
    label: y
  }));
});

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

// Auto-filter when month or year changes
watch([selectedMonth, selectedYear], () => {
  fetchOrders();
});

// Fetch raises when tab changes
watch(activeTab, async (newTab) => {
  if (newTab === 'raises' && user?.value?._id) {
    await fetchRaises();
  }
});

// Fetch user's raises
const fetchRaises = async () => {
  try {
    const data = await $fetch(`/api/raises/${user.value._id}?page=${raisesPage.value}&limit=${raisesPageSize.value}`);
    raises.value = data.raises || [];
    raisesTotal.value = data.total || 0;
  } catch (error) {
    console.error('Error fetching raises:', error);
    // You might want to show an error message to the user here
  }
};

const fetchOrders = () => {
  loadOrders(selectedMonth.value, selectedYear.value);
};

const handleFilterChange = () => {
  ordersPage = 1; // Reset to first page when filters change
  fetchOrders();
};

// Auto-filter on page mount
onMounted(() => {
  loadProfileData();
  fetchOrders();
});

const openOrderPopup = (orderId) => {
  selectedOrderId.value = orderId;
  isOrderPopupOpen.value = true;
};

const closeOrderPopup = () => {
  isOrderPopupOpen.value = false;
  // Small delay before clearing the order ID to allow for smooth animation
  setTimeout(() => {
    selectedOrderId.value = null;
  }, 200);
};

const loadOrders = async (month, year) => {
  const data = await $fetch(`/api/users/orders/month?userId=${user.value._id}&month=${month}&year=${year}&page=${ordersPage.value}&limit=${ordersPageSize.value}`);
  monthlyOrders.value = data.orders || [];
  ordersTotal.value = data.total || 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const loadProfileData = async () => {
  const userId = user.value._id;
  const [balanceData, history] = await Promise.all([
    $fetch(`/api/users/balance?userId=${userId}`),
    $fetch(`/api/users/orders/history?userId=${userId}`)
  ]);
  balance.value = balanceData.balance;
  orderHistory.value = history;
};
</script>