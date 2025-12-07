<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Order Popup -->
    <OrderPopUp
      :is-open="isOrderPopupOpen"
      :order-id="selectedOrderId"
      @close="closeOrderPopup"
    />

    <h1 class="text-3xl font-bold mb-6">{{ $t("profile.title") }}</h1>

    <!-- User Info -->
    <div class="dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
      <div class="flex flex-row justify-between items-center mb-2">
        <h2 class="text-xl font-semibold">
          {{ $t("profile.accountInfo") }}
        </h2>
        <NuxtLink
          to="/user/guests"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {{ $t("guests.title") }}
        </NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-2 max-w-md">
        <span class="font-medium">{{ $t("username") }}:</span>
        <span>{{ user?.username }}</span>
        <span class="font-medium">{{ $t("email") }}:</span>
        <span>{{ user?.email }}</span>
        <span class="font-medium">{{ $t("balance") }}:</span>
        <span :class="balance >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ format(balance) }}
        </span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
            :class="getTabClasses(tab.key)"
            @click="activeTab = tab.key"
          >
            {{ $t(tab.label) }}
            <span
              v-if="activeTab === tab.key"
              class="hidden md:inline-block ml-2 py-0.5 px-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium"
            >
              {{ tab.key === "orders" ? ordersTotal : raises.length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Orders Tab -->
    <div
      v-if="activeTab === 'orders'"
      class="dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6"
    >
      <!-- Filters -->
      <div class="flex items-center gap-4 mb-4 flex-wrap">
        <select
          v-model="selectedMonth"
          class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
          @change="searchOrders"
        >
          <option value="">{{ $t("profile.anyMonth") }}</option>
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
          @change="searchOrders"
        >
          <option
            v-for="year in availableYears"
            :key="year.value"
            :value="year.value"
          >
            {{ year.label }}
          </option>
        </select>
      </div>

      <DataTable
        :columns="orderColumns"
        :data="formattedOrders"
        :pagination="ordersPagination"
        :no-data-text="$t('profile.noOrders')"
        @update:page="updateOrdersPage"
      >
        <template #cell-actions="{ row: order }">
          <button
            class="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
            @click="openOrderPopup(order.id)"
          >
            {{ $t("profile.viewOrder") }}
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Raises Tab -->
    <div
      v-else-if="activeTab === 'raises'"
      class="dark:bg-gray-800 shadow-md rounded-lg p-4"
    >
      <h2 class="text-xl font-semibold mb-4">{{ $t("profile.raises") }}</h2>

      <DataTable
        :columns="raisesColumns"
        :data="formattedRaises"
        :pagination="raisesPagination"
        :no-data-text="$t('profile.noRaisesFound')"
        @update:page="updateRaisesPage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import DataTable from "~/components/DataTable.vue";

const { format } = useMoney();
const { t } = useI18n();
const { user } = useUserSession();

// State
const activeTab = ref("orders");
const orders = ref([]);
const raises = ref([]);
const balance = ref(0);
const selectedOrderId = ref(null);
const isOrderPopupOpen = ref(false);

// Pagination state
const ordersPage = ref(1);
const ordersPageSize = ref(10);
const ordersTotal = ref(0);
const raisesPage = ref(1);
const raisesPageSize = ref(10);
const raisesTotal = ref(0);

// Filter state
const selectedMonth = ref("");
const selectedYear = ref(new Date().getFullYear().toString());

// Constants
const tabs = [
  { key: "orders", label: "orders" },
  { key: "raises", label: "raises" },
];

const monthOptions = computed(() => {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    const date = new Date(2024, i - 1, 1);
    months.push({
      value: i.toString(),
      label: date.toLocaleDateString(undefined, { month: "long" }),
    });
  }
  return months;
});

const availableYears = computed(() => {
  if (!user.value?.createdAt) return [];

  const userCreatedYear = new Date(user.value.createdAt).getFullYear();
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= userCreatedYear; year--) {
    years.push({
      value: year.toString(),
      label: year.toString(),
    });
  }

  return years;
});

// Table configurations
const orderColumns = computed(() => [
  { header: t("date"), field: "createdAt", align: "left" },
  { header: t("barkeeper"), field: "bartender", align: "left" },
  { header: t("total"), field: "total", align: "left" },
  { header: t("actions"), field: "actions", align: "right" },
]);

const raisesColumns = computed(() => [
  { header: t("date"), field: "createdAt", align: "left" },
  { header: t("raisedBy"), field: "raiser", align: "left" },
  { header: t("Amount"), field: "amount", align: "right" },
]);

// Formatted data
const formattedOrders = computed(() =>
  orders.value.map((order) => ({
    ...order,
    bartender: order.bartender.username,
    total: format(order.total),
    createdAt: formatDate(order.createdAt),
    actions: "",
  }))
);

const formattedRaises = computed(() =>
  raises.value.map((raise) => ({
    ...raise,
    raiser: `${raise.raiser.firstName} ${raise.raiser.lastName}`,
    amount: format(raise.amount),
    createdAt: formatDate(raise.createdAt),
  }))
);

// Pagination objects
const ordersPagination = computed(() => ({
  page: ordersPage.value,
  pageSize: ordersPageSize.value,
  total: ordersTotal.value,
}));

const raisesPagination = computed(() => ({
  page: raisesPage.value,
  pageSize: raisesPageSize.value,
  total: raisesTotal.value,
}));

// Methods
const getTabClasses = (tabKey) => {
  return activeTab.value === tabKey
    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200";
};

const updateOrdersPage = (page) => {
  ordersPage.value = page;
  searchOrders();
};

const updateRaisesPage = (page) => {
  raisesPage.value = page;
  fetchRaises();
};

const searchOrders = async () => {
  try {
    const params = new URLSearchParams({
      userId: user.value.id,
      page: ordersPage.value.toString(),
      limit: ordersPageSize.value.toString(),
    });

    if (selectedMonth.value) {
      params.append("month", selectedMonth.value);
    }
    if (selectedYear.value) {
      params.append("year", selectedYear.value);
    }

    const data = await $fetch(`/api/users/orders?${params.toString()}`);
    orders.value = data.orders || [];
    ordersTotal.value = data.total || 0;
  } catch (error) {
    console.error("Error loading orders:", error);
  }
};

const fetchRaises = async () => {
  try {
    const data = await $fetch(
      `/api/raises/${user.value.id}?page=${raisesPage.value}&limit=${raisesPageSize.value}`
    );
    raises.value = data.raises || [];
    raisesTotal.value = data.total || 0;
  } catch (error) {
    console.error("Error fetching raises:", error);
  }
};

const loadProfileData = async () => {
  const userId = user.value.id;
  const balanceData = await $fetch(`/api/users/balance?userId=${userId}`);
  balance.value = balanceData.balance;
};

const openOrderPopup = (orderId) => {
  selectedOrderId.value = orderId;
  isOrderPopupOpen.value = true;
};

const closeOrderPopup = () => {
  isOrderPopupOpen.value = false;
  setTimeout(() => {
    selectedOrderId.value = null;
  }, 200);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Watchers
watch(activeTab, async (newTab) => {
  if (newTab === "raises" && user?.value?.id) {
    await fetchRaises();
  }
});

// Lifecycle
onMounted(async () => {
  await loadProfileData();
  await searchOrders();
});
</script>
