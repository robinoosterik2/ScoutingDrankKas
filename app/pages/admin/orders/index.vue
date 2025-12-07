<template>
  <!-- ...existing layout header... -->
  <CTitle :text="$t('orders.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')" />
    <!-- You can add a create order button here if needed -->
  </div>

  <!-- Filter Inputs -->
  <div class="flex mb-4 space-x-2">
    <input
      v-model="filterUser"
      type="text"
      placeholder="Filter by User"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
    <input
      v-model="filterBartender"
      type="text"
      placeholder="Filter by Bartender"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
  </div>

  <!-- Orders Table -->
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-visible">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <!-- ...existing table columns... -->
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("date") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("customer") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("barkeeper") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("total") }}
          </th>
          <th
            class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("actions") }}
          </th>
        </tr>
      </thead>
      <tbody
        class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
      >
        <tr
          v-for="order in paginatedOrders"
          :key="order.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
        >
          <td class="px-6 py-2 whitespace-nowrap">
            {{
              new Date(order.createdAt).toLocaleString("nl-nl", {
                hour12: false,
              })
            }}
          </td>
          <td class="px-6 py-2 whitespace-nowrap">
            {{ order.user.firstName }} {{ order.user.lastName }}
          </td>
          <td class="px-6 py-2 whitespace-nowrap">
            {{ order.bartender.firstName }} {{ order.bartender.lastName }}
          </td>
          <td class="px-6 py-2 whitespace-nowrap">{{ format(order.total) }}</td>
          <td class="px-6 py-2 whitespace-nowrap text-right">
            <CDropdown
              :id="`order-${order.id}`"
              v-model="selectedValue"
              :items="dropdownItems"
              :placeholder="$t('Actions')"
              value="action"
              @update:model-value="handleAction(order)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      v-if="filteredOrders.length > 0"
      class="px-6 py-3 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ $t("pagination.showing") }}
          <span class="font-medium">{{
            Math.min(
              (currentPage - 1) * itemsPerPage + 1,
              filteredOrders.length
            )
          }}</span>
          {{ $t("pagination.to") }}
          <span class="font-medium">{{
            Math.min(currentPage * itemsPerPage, filteredOrders.length)
          }}</span>
          {{ $t("pagination.of") }}
          <span class="font-medium">{{ filteredOrders.length }}</span>
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
          <template v-for="page in Math.min(5, totalPages)" :key="page">
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
                'bg-indigo-600 text-white': currentPage === totalPages,
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
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredOrders.length === 0"
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t("orders.noOrders") }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t("orders.checkBackLater") }}
      </p>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <DeleteConfirmationModal
    :is-open="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('Order')"
    :message="`${$t('orders.confirmDelete')} '${orderToDelete?.id}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirm-text="$t('delete')"
    :cancel-text="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />

  <!-- Order Popup Modal -->
  <OrderPopUp
    :is-open="isPopupOpen"
    :order-id="selectedOrderId"
    @close="closePopup"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";
import OrderPopUp from "@/components/OrderPopUp.vue";
import BackLink from "@/components/BackLink.vue";
import CTitle from "@/components/CTitle.vue";

const { format } = useMoney();
const { t: _t } = useI18n();
const orders = ref([]);
const dropdownItems = ref([
  { label: _t("view"), value: "view" },
  { label: _t("delete"), value: "delete" },
]);
const selectedValue = ref(null);

// Filter states
const filterUser = ref("");
const filterBartender = ref("");

// Computed filtered orders based on user and bartender filters
const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const customerName =
      `${order.user.firstName} ${order.user.lastName}`.toLowerCase();
    const bartenderName =
      `${order.bartender.firstName} ${order.bartender.lastName}`.toLowerCase();
    const userMatch = customerName.includes(filterUser.value.toLowerCase());
    const bartenderMatch = bartenderName.includes(
      filterBartender.value.toLowerCase()
    );
    return userMatch && bartenderMatch;
  });
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Computed properties for pagination
const totalPages = computed(() =>
  Math.ceil(filteredOrders.value.length / itemsPerPage.value)
);

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredOrders.value.slice(start, end);
});

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Reset to first page when filters change
watch([filterUser, filterBartender], () => {
  currentPage.value = 1;
});

// Order deletion state
const isDeleteModalOpen = ref(false);
const orderToDelete = ref(null);

// Order popup state
const isPopupOpen = ref(false);
const selectedOrderId = ref(null);

try {
  orders.value = await $fetch("/api/orders/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch orders:", error);
  // Handle error appropriately in production
}

const handleAction = (order) => {
  const action = selectedValue.value;
  if (action === "view") {
    openViewPopup(order);
  } else if (action === "delete") {
    openDeleteConfirmation(order);
  }
};

const openDeleteConfirmation = (order) => {
  orderToDelete.value = order;
  isDeleteModalOpen.value = true;
};

const closeDeleteConfirmation = () => {
  isDeleteModalOpen.value = false;
  orderToDelete.value = null;
};

const confirmDelete = async () => {
  if (orderToDelete.value) {
    try {
      await $fetch(`/api/admin/orders/delete`, {
        method: "POST",
        body: JSON.stringify({ id: orderToDelete.value.id }),
      });
      orders.value = orders.value.filter(
        (o) => o.id !== orderToDelete.value.id
      );
    } catch (error) {
      console.error("Failed to delete order:", error);
      // Show error message to user in production
    }
    closeDeleteConfirmation();
  }
};

const openViewPopup = (order) => {
  selectedOrderId.value = order.id;
  isPopupOpen.value = true;
};

const closePopup = () => {
  isPopupOpen.value = false;
  selectedOrderId.value = null;
};
</script>
