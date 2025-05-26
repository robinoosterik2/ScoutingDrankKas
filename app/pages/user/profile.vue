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
		<div class="mb-4 flex gap-4 border-b border-gray-300">
			<button
				class="pb-2 px-4 font-medium"
				:class="{ 'border-b-2 border-blue-500': activeTab === 'orders' }"
				@click="activeTab = 'orders'"
			>
				{{ $t('orders') }}
			</button>
			<button
				class="pb-2 px-4 font-medium"
				:class="{ 'border-b-2 border-blue-500': activeTab === 'raises' }"
				@click="activeTab = 'raises'"
			>
				{{ $t('raises') }}
			</button>
		</div>

		<!-- Orders Tab -->
		<div v-if="activeTab === 'orders'">
      <!-- Month/Year Filter -->
      <div class="flex items-center gap-4 mb-4">
        <select
            v-model="selectedMonth"
            class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
            >
                <option value="">{{ $t("profile.selectMonth") }}</option>
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
            class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
            >
                <option value="">{{ $t("profile.selectYear") }}</option>
                <option
                    v-for="year in yearOptions"
                    :key="year.value"
                    :value="year.value"
                >
                    {{ year.label }}
                </option>
            </select>
      </div>

      <!-- Orders Table -->
      <div v-if="monthlyOrders.length" class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-visible">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('barkeeper') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('total') }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="order in monthlyOrders" :key="order._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <td class="px-6 py-2 whitespace-nowrap">{{ formatDate(order.createdAt) }}</td>
              <td class="px-6 py-2 whitespace-nowrap">{{ order.bartender.firstName }} {{ order.bartender.lastName }}</td>
              <td class="px-6 py-2 whitespace-nowrap">€{{ order.total }}</td>
              <td class="px-6 py-2 whitespace-nowrap text-right">
                <button @click="openOrderPopup(order._id)" class="px-3 py-1 rounded bg-blue-500 text-white">{{ $t('profile.viewOrder') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls for Orders -->
        <div class="flex justify-center items-center gap-2 mt-4">
          <button :disabled="ordersPage === 1" @click="() => { ordersPage--; fetchOrders(); }" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700" >Prev</button>
          <span>{{ ordersPage }}</span>
          <button :disabled="ordersPage * ordersPageSize >= ordersTotal" @click="() => { ordersPage++; fetchOrders(); }" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Next</button>
          <span class="text-xs text-gray-500 ml-2">{{ $t('profile.total') }}: {{ ordersTotal }}</span>
        </div>
        <div v-if="monthlyOrders.length === 0" class="text-center py-12 px-4 sm:px-6 lg:px-8 text-gray-400">
          {{ $t('profile.noOrders') }}
        </div>
      </div>
      <div v-else class="text-center py-12 px-4 sm:px-6 lg:px-8 text-gray-400">
        {{ $t('profile.noOrders') }}
      </div>

		</div>

		<!-- Raises Tab -->
		<div v-else-if="activeTab === 'raises'" class="dark:bg-gray-800 shadow-md rounded-lg p-4">
			<h2 class="text-xl font-semibold mb-4">{{ $t('profile.raises') }}</h2>
      
      <div v-if="raises.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('date') }}</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('raisedBy') }}</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{{ $t('Amount') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="raise in raises" :key="raise._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <td class="px-6 py-2 whitespace-nowrap">{{ formatDate(raise.createdAt) }}</td>
              <td class="px-6 py-2 whitespace-nowrap">
                {{ raise.raiser.firstName }} {{ raise.raiser.lastName }}
              </td>
              <td class="px-6 py-2 whitespace-nowrap text-right">€{{ raise.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination Controls for Raises -->
        <div class="flex justify-center items-center gap-2 mt-4">
          <button :disabled="raisesPage === 1" @click="() => { raisesPage--; fetchRaises(); }" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Prev</button>
          <span>{{ raisesPage }}</span>
          <button :disabled="raisesPage * raisesPageSize >= raisesTotal" @click="() => { raisesPage++; fetchRaises(); }" class="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Next</button>
          <span class="text-xs text-gray-500 ml-2">{{ $t('profile.total') }}: {{ raisesTotal }}</span>
        </div>
      </div>
      <div v-else class="text-center py-12 px-4 sm:px-6 lg:px-8 text-gray-400">
        {{ $t('profile.noRaisesFound') }}
      </div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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