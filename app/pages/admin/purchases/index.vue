<template>
  <div>
    <CTitle :text="$t('purchases.title')" />
    <div class="flex justify-between items-center mb-6">
      <BackLink to="/admin" :backPage="$t('admin.title')" />

      <!-- Add Purchase Button -->
      <button
        @click="openPurchaseModal"
        class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {{ $t("purchases.newPurchase") }}
      </button>
    </div>

    <!-- Purchase Form Modal -->
    <PurchaseForm
      :isOpen="isModalOpen"
      :products="products"
      @close="closePurchaseModal"
      @submit="handlePurchaseSubmit"
    />

    <!-- Success/Error Notifications -->
    <Transition name="slide-down">
      <div
        v-if="showNotification"
        class="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div
          :class="[
            'p-4 rounded-lg shadow-lg border',
            notificationType === 'success'
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
          ]"
        >
          <div class="flex items-center">
            <svg
              v-if="notificationType === 'success'"
              class="w-5 h-5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <div>
              <p class="font-medium">{{ notificationMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Main Content -->
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="w-full">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- Header with Search/Filter -->
            <div
              class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600 space-y-4"
            >
              <div class="flex items-center justify-between">
                <h2
                  class="text-lg font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  {{ $t("purchases.recentPurchases") }}
                </h2>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ totalPurchases }} {{ $t("purchases.entries") }}
                </div>
              </div>

              <!-- Search and Filter Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- User Search -->
                <div class="w-full">
                  <CSelect
                    v-model="searchFilters.searchUser"
                    :items="users"
                    :placeholder="$t('purchases.searchUser')"
                    item-text="username"
                    :search-keys="[
                      'username',
                      'firstName',
                      'lastName',
                      'email',
                    ]"
                    @update:model-value="
                      (val) => {
                        searchFilters.searchUser = val || null;
                        performSearch();
                      }
                    "
                  />
                </div>

                <!-- Product Search -->
                <div class="w-full">
                  <CSelect
                    v-model="searchFilters.searchProduct"
                    :items="selectableProducts"
                    :placeholder="$t('purchases.searchProduct')"
                    item-text="name"
                    :search-keys="['name', 'description']"
                    @update:model-value="
                      (val) => {
                        searchFilters.searchProduct = val || null;
                        performSearch();
                      }
                    "
                  />
                </div>

                <!-- Date From -->
                <div class="w-full">
                  <DatePicker
                    v-model="searchFilters.dateFrom"
                    :placeholder="$t('purchases.dateFrom') || 'From date'"
                    :max="searchFilters.dateTo || today"
                    @update:model-value="performSearch"
                  />
                </div>

                <!-- Date To -->
                <div class="w-full">
                  <DatePicker
                    v-model="searchFilters.dateTo"
                    :placeholder="$t('purchases.dateTo') || 'To date'"
                    :min="searchFilters.dateFrom"
                    :max="today"
                    @update:model-value="performSearch"
                  />
                </div>
              </div>

              <!-- Clear Filters Button -->
              <div v-if="hasActiveFilters" class="flex justify-end">
                <button
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                  @click="clearFilters"
                >
                  <svg
                    class="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {{ $t("purchases.clearFilters") }}
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoadingPurchases" class="p-12 text-center">
              <div
                class="inline-flex items-center px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400"
              >
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ $t("loading") }}
              </div>
            </div>

            <!-- Table -->
            <div v-else>
              <DataTable
                :columns="tableColumns"
                :data="stockPurchases"
                :pagination="tablePagination"
                :no-data-text="
                  hasActiveFilters
                    ? $t('purchases.noFilteredResults')
                    : $t('purchases.noPurchasesTitle')
                "
                @update:page="goToPage"
              >
                <!-- Product Name Cell -->
                <template #cell-product="{ row }">
                  <div class="flex flex-col">
                    <span
                      class="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      {{ getProductName(row.productId) }}
                    </span>
                  </div>
                </template>

                <!-- Quantity Cell -->
                <template #cell-quantity="{ row }">
                  <div class="flex flex-col space-y-1">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
                          row.quantity >= 12,
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
                          row.quantity >= 6 && row.quantity < 12,
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
                          row.quantity < 6,
                      }"
                    >
                      {{ row.quantity }}
                      {{
                        row.quantity === 1
                          ? $t("purchases.unit")
                          : $t("purchases.units")
                      }}
                    </span>
                    <span
                      v-if="row.packSize && row.packQuantity"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      ({{ row.packQuantity }} × {{ row.packSize }})
                    </span>
                  </div>
                </template>

                <!-- Price Cell -->
                <template #cell-price="{ row }">
                  <span
                    class="text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    {{ format(row.price) }}
                  </span>
                </template>

                <!-- User Cell -->
                <template #cell-user="{ row }">
                  <span
                    v-if="row.userId"
                    class="text-sm text-indigo-600 dark:text-indigo-400"
                  >
                    {{ getUserName(row.userId) }}
                  </span>
                  <span v-else class="text-sm text-gray-500 dark:text-gray-400">
                    Unknown User
                  </span>
                </template>

                <!-- Date Cell -->
                <template #cell-date="{ row }">
                  <span class="text-sm text-gray-600 dark:text-gray-400">
                    {{ formatDate(row.purchaseDate) }}
                  </span>
                </template>

                <!-- Notes Cell -->
                <template #cell-notes="{ row }">
                  <div v-if="row.notes" class="max-w-xs">
                    <p
                      class="text-sm text-gray-600 dark:text-gray-300 italic truncate"
                      :title="row.notes"
                    >
                      "{{ row.notes }}"
                    </p>
                  </div>
                  <span v-else class="text-sm text-gray-400">-</span>
                </template>

                <!-- Actions Cell -->
                <template #cell-actions="{ row }">
                  <button
                    type="button"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    @click="viewPurchase(row)"
                  >
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </template>

                <!-- Empty State Slot -->
                <template #empty>
                  <div class="text-center py-8">
                    <div
                      class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
                    >
                      <svg
                        class="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <h3
                      class="text-lg font-medium text-gray-900 dark:text-white mb-2"
                    >
                      {{
                        hasActiveFilters
                          ? $t("purchases.noFilteredResults")
                          : $t("purchases.noPurchasesTitle")
                      }}
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400">
                      {{
                        hasActiveFilters
                          ? $t("purchases.tryDifferentFilters")
                          : $t("purchases.noPurchases")
                      }}
                    </p>
                  </div>
                </template>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PurchaseForm from "~/components/PurchaseForm.vue";
import DatePicker from "~/components/DatePicker.vue";

const { t } = useI18n();

// Get today's date in YYYY-MM-DD format for max date
const today = new Date().toISOString().split("T")[0];

const products = ref([]);
const fetchProducts = async () => {
  try {
    const response = await $fetch("/api/products/all");
    products.value = response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Modal state
const isModalOpen = ref(false);

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);

// Users and products for selects
const users = ref([]);
const selectableProducts = ref([]);

// Search and filter state
const searchFilters = ref({
  searchUser: null,
  searchProduct: null,
  dateFrom: "",
  dateTo: "",
});

// Stock purchases data and state
const stockPurchases = ref([]);
const totalPurchases = ref(0);
const isLoadingPurchases = ref(false);

// Notification state
const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");
const { format, parse } = useMoney();

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.values(searchFilters.value).some(
    (value) => value !== "" && value !== null
  );
});

const totalPages = computed(() =>
  Math.ceil(totalPurchases.value / pageSize.value)
);

// Table configuration
const tableColumns = computed(() => [
  {
    header: "Product",
    field: "product",
    sortable: false,
  },
  {
    header: "Quantity",
    field: "quantity",
    sortable: true,
    align: "center",
  },
  {
    header: "Price",
    field: "price",
    sortable: true,
    align: "right",
  },
  {
    header: "User",
    field: "user",
    sortable: false,
  },
  {
    header: "Date",
    field: "date",
    sortable: true,
  },
  {
    header: "Notes",
    field: "notes",
    sortable: false,
  },
  {
    header: "Actions",
    field: "actions",
    sortable: false,
    align: "center",
  },
]);

const tablePagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  total: totalPurchases.value,
}));

// Watchers
watch(currentPage, (newPage) => {
  fetchStockPurchases(newPage, pageSize.value);
});

// Modal methods
const openPurchaseModal = () => {
  isModalOpen.value = true;
};
const closePurchaseModal = () => {
  isModalOpen.value = false;
};

const handlePurchaseSubmit = async (purchaseData) => {
  try {
    // Parse price properly
    const processedData = {
      ...purchaseData,
      price: parse(purchaseData.price),
    };

    // Make API call to save the new stock purchase
    await $fetch("/api/admin/purchases", {
      method: "POST",
      body: processedData,
    });

    // Refresh the purchases list
    await fetchStockPurchases(currentPage.value, pageSize.value);

    // Close modal and show success message
    closePurchaseModal();
    showNotificationMessage(t("purchases.purchaseAdded"), "success");
  } catch (error) {
    console.error("Error adding stock purchase:", error);
    showNotificationMessage(t("purchases.errors.addFailed"), "error");
  }
};

// Methods
const performSearch = () => {
  currentPage.value = 1;
  fetchStockPurchases(1, pageSize.value);
};

const clearFilters = () => {
  searchFilters.value = {
    searchUser: null,
    searchProduct: null,
    dateFrom: "",
    dateTo: "",
  };
  performSearch();
};

const fetchStockPurchases = async (page = 1, limit = 10) => {
  try {
    isLoadingPurchases.value = true;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add search and filter parameters if they exist
    if (searchFilters.value.searchUser) {
      queryParams.append("searchUser", searchFilters.value.searchUser);
    }
    if (searchFilters.value.searchProduct) {
      queryParams.append("searchProduct", searchFilters.value.searchProduct);
    }
    if (searchFilters.value.dateFrom) {
      queryParams.append("dateFrom", searchFilters.value.dateFrom);
    }
    if (searchFilters.value.dateTo) {
      queryParams.append("dateTo", searchFilters.value.dateTo);
    }

    const response = await $fetch(`/api/admin/purchases?${queryParams}`);
    if (response) {
      stockPurchases.value = response.data;
      totalPurchases.value = response.total;
    }
  } catch (error) {
    console.error("Error fetching stock purchases:", error);
    showNotificationMessage(t("purchases.errors.fetchPurchases"), "error");
  } finally {
    isLoadingPurchases.value = false;
  }
};

const fetchUsersAndProducts = async () => {
  try {
    const [usersResponse, productsResponse] = await Promise.all([
      $fetch("/api/users/all"),
      $fetch("/api/products/all"),
    ]);
    users.value = usersResponse;
    selectableProducts.value = productsResponse.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      packSize: p.packSize || 1,
    }));
  } catch (error) {
    console.error("Error fetching users or products:", error);
    showNotificationMessage(
      t("purchases.errors.fetchUsersAndProducts"),
      "error"
    );
  }
};

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// View purchase details
const viewPurchase = (purchase) => {
  // TODO: Implement purchase detail view
  console.log("View purchase:", purchase);
};

// Helper methods
const getProductName = (purchaseProduct) => {
  if (purchaseProduct.name) {
    return purchaseProduct.name;
  }
  const product = products.value.find((p) => p.id === purchaseProduct.id);
  return product ? product.name : "Unknown Product";
};

const getUserName = (purchaseUser) => {
  if (purchaseUser && purchaseUser.firstName && purchaseUser.lastName) {
    return `${purchaseUser.firstName} ${purchaseUser.lastName}`;
  }
  return "Unknown User";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const showNotificationMessage = (message, type) => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 4000);
};

// Initial fetch
onMounted(() => {
  fetchProducts();
  fetchStockPurchases();
  fetchUsersAndProducts();
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
