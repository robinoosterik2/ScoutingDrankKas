<template>
  <!-- ...existing layout header... -->
  <CTitle :text="$t('orders.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :backPage="$t('admin.title')"></BackLink>
    <!-- You can add a create order button here if needed -->
  </div>

  <!-- Filter Inputs -->
  <div class="flex mb-4 space-x-2">
    <input
      v-model="filterUser"
      type="text"
      placeholder="Filter by User"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    />
    <input
      v-model="filterBartender"
      type="text"
      placeholder="Filter by Bartender"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    />
  </div>

  <!-- Orders Table -->
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-visible">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <!-- ...existing table columns... -->
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {{ $t("date") }}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {{ $t("customer") }}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {{ $t("barkeeper") }}
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {{ $t("total") }}
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            {{ $t("actions") }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
        <tr v-for="order in filteredOrders" :key="order._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
            <td class="px-6 py-2 whitespace-nowrap">{{ new Date(order.createdAt).toLocaleString('nl-nl', { hour12: false }) }}</td>
          <td class="px-6 py-2 whitespace-nowrap">{{ order.user.firstName }} {{ order.user.lastName }}</td>
          <td class="px-6 py-2 whitespace-nowrap">{{ order.bartender.firstName }} {{ order.bartender.lastName }}</td>
          <td class="px-6 py-2 whitespace-nowrap">€{{ order.total }}</td>
          <td class="px-6 py-2 whitespace-nowrap text-right">
            <CDropdown
              v-model="selectedValue"
              :items="dropdownItems"
              @update:model-value="handleAction(order)"
              value="action"
              :placeholder="$t('Actions')"
              :id="`order-${order._id}`"
            />
          </td>
        </tr>
      </tbody>
    </table>
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
    :isOpen="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('Order')"
    :message="`${$t('orders.confirmDelete')} '${orderToDelete?._id}'? ${$t('cannotBeUndone')}`"
    :confirmText="$t('delete')"
    :cancelText="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />

  <!-- Order Popup Modal -->
  <OrderPopUp
    :isOpen="isPopupOpen"
    :orderId="selectedOrderId"
    @close="closePopup"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";
import OrderPopUp from "@/components/OrderPopUp.vue";

const { t } = useI18n();
const orders = ref([]);
const dropdownItems = ref([
  { label: t("view"), value: "view" },
  { label: t("delete"), value: "delete" },
]);
const selectedValue = ref(null);

// Filter states
const filterUser = ref("");
const filterBartender = ref("");

// Computed filtered orders based on user and bartender filters
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const customerName = `${order.user.firstName} ${order.user.lastName}`.toLowerCase();
    const bartenderName = `${order.bartender.firstName} ${order.bartender.lastName}`.toLowerCase();
    const userMatch = customerName.includes(filterUser.value.toLowerCase());
    const bartenderMatch = bartenderName.includes(filterBartender.value.toLowerCase());
    return userMatch && bartenderMatch;
  });
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
        body: JSON.stringify({ id: orderToDelete.value._id }),
      });
      orders.value = orders.value.filter(o => o._id !== orderToDelete.value._id);
    } catch (error) {
      alert("Failed to delete order. Please try again.");
    }
    closeDeleteConfirmation();
  }
};

const openViewPopup = (order) => {
  selectedOrderId.value = order._id;
  isPopupOpen.value = true;
};

const closePopup = () => {
  isPopupOpen.value = false;
  selectedOrderId.value = null;
};
</script>
