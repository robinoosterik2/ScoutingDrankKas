<template>
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

  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t("stock.recentPurchases") }}
        </h2>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          {{ $t("stock.subtitle") }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- Form Header -->
            <div
              class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4"
            >
              <h2 class="text-lg font-semibold text-white flex items-center">
                <svg
                  class="w-5 h-5 mr-3"
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
                {{ $t("stock.newStockPurchase") }}
              </h2>
            </div>

            <!-- Form Content -->
            <form @submit.prevent="submitStockPurchase" class="p-6 space-y-6">
              <!-- Product Selection -->
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ $t("stock.product") }}
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="selectedProduct"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none bg-white dark:bg-gray-700"
                    required
                  >
                    <option :value="null" disabled>
                      {{ $t("stock.selectProduct") }}
                    </option>
                    <option
                      v-for="product in products"
                      :key="product.id"
                      :value="product"
                    >
                      {{ product.name }}
                      <template v-if="product.packSize && product.packSize > 1">
                        ({{ $t("stock.packOf", { count: product.packSize }) }})
                      </template>
                    </option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none"
                  >
                    <svg
                      class="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Quantity Section -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ $t("stock.quantity") }}
                    <span class="text-red-500">*</span>
                  </label>
                  <span
                    v-if="selectedProductPackSize > 1"
                    class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                  >
                    {{ $t("stock.packOf", { count: selectedProductPackSize }) }}
                  </span>
                </div>

                <!-- Pack Quantity Input -->
                <div v-if="showCrateQuantity" class="space-y-3">
                  <div class="flex items-center space-x-4">
                    <div class="flex-1">
                      <div class="relative">
                        <input
                          v-model.number="crateQuantity"
                          type="number"
                          min="1"
                          step="1"
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                          placeholder="1"
                        />
                        <div
                          class="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          <span
                            class="text-sm text-gray-500 dark:text-gray-400"
                          >
                            {{ $t("stock.packs") }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        type="button"
                        @click="crateQuantity = Math.max(1, crateQuantity - 1)"
                        class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        @click="crateQuantity += 1"
                        class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          class="w-4 h-4"
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
                      </button>
                    </div>
                  </div>
                  <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div
                      class="flex items-center text-sm text-blue-800 dark:text-blue-200"
                    >
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span>
                        {{ crateQuantity }} {{ $t("stock.packs") }} =
                        <strong>{{
                          crateQuantity * selectedProductPackSize
                        }}</strong>
                        {{ $t("stock.units") }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Regular Quantity Input -->
                <div v-else class="flex items-center space-x-4">
                  <div class="flex-1">
                    <input
                      v-model.number="quantity"
                      type="number"
                      min="1"
                      step="1"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white [appearance:textfield]"
                      placeholder="1"
                    />
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      type="button"
                      class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      @click="quantity = Math.max(1, quantity - 1)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      @click="quantity += 1"
                      class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        class="w-4 h-4"
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
                    </button>
                  </div>
                </div>
              </div>

              <!-- Price Input -->
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ $t("stock.totalPrice") }}
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500 dark:text-gray-400">€</span>
                  </div>
                  <input
                    v-model.number="newSpree.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white [appearance:textfield]"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <!-- Notes -->
              <div class="space-y-2">
                <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {{ $t("stock.notes") }}
                </label>
                <textarea
                  v-model="newSpree.notes"
                  rows="3"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                  :placeholder="$t('stock.notesPlaceholder')"
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isSubmitting || !selectedProduct"
                class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span
                  v-if="isSubmitting"
                  class="flex items-center justify-center"
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
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ $t("stock.submitting") }}
                </span>
                <span v-else>{{ $t("stock.addSpree") }}</span>
              </button>
            </form>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <!-- History Header -->
            <div
              class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600"
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
                  {{ $t("stock.recentSprees") }}
                </h2>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ stockPurchases.length }} {{ $t("stock.entries") }}
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-12 text-center">
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
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ $t("loading") }}
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="stockPurchases.length === 0"
              class="p-12 text-center"
            >
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
                {{ $t("stock.noSpreesTitle") }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400">
                {{ $t("stock.noSprees") }}
              </p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="purchase in stockPurchases"
                :key="purchase._id"
                class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-3">
                      <h3
                        class="text-base font-medium text-gray-900 dark:text-white"
                      >
                        {{ getProductName(purchase.productId) }}
                      </h3>
                      <span
                        class="px-2 py-0.5 text-xs font-medium rounded-full"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400':
                            purchase.quantity >= 12,
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400':
                            purchase.quantity >= 6 && purchase.quantity < 12,
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400':
                            purchase.quantity < 6,
                        }"
                      >
                        {{ purchase.quantity }}
                        {{
                          purchase.quantity === 1
                            ? $t("stock.units")
                            : $t("stock.units")
                        }}
                      </span>
                    </div>
                    <div
                      class="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      <span class="font-medium">{{
                        format(purchase.price)
                      }}</span>
                      <span class="mx-2">•</span>
                      <span>{{ formatDate(purchase.createdAt) }}</span>
                    </div>
                  </div>
                  <div class="ml-4 flex-shrink-0">
                    <button
                      type="button"
                      class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <span class="sr-only">{{ $t("common.view") }}</span>
                      <svg
                        class="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div v-if="purchase.notes" class="mt-3 pl-13">
                  <p class="text-sm text-gray-600 dark:text-gray-300 italic">
                    "{{ purchase.notes }}"
                  </p>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="totalPages > 1"
              class="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between"
            >
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t("common.showing") }}
                <span class="font-medium">{{
                  (currentPage - 1) * pageSize + 1
                }}</span>
                {{ $t("common.to") }}
                <span class="font-medium">{{
                  Math.min(currentPage * pageSize, totalSprees)
                }}</span>
                {{ $t("common.of") }}
                <span class="font-medium">{{ totalSprees }}</span>
                {{ $t("common.results") }}
              </div>
              <div class="flex space-x-1">
                <button
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="prevPage"
                >
                  {{ $t("common.previous") }}
                </button>

                <button
                  v-for="page in totalPages"
                  :key="page"
                  :class="[
                    'px-3 py-1 rounded-md border',
                    currentPage === page
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600',
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>

                <button
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="nextPage"
                >
                  {{ $t("common.next") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const products = ref([]);
const fetchProducts = async () => {
  try {
    const response = await $fetch("/api/products/all");
    products.value = response;
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

// Pagination state
const currentPage = ref(1);
const pageSize = ref(5);

// Stock purchases data and state
const stockPurchases = ref([]);
const totalPurchases = ref(0);
const isLoadingPurchases = ref(false);

// Fetch stock purchases from API
const fetchStockPurchases = async (page = 1, limit = 5) => {
  try {
    isLoadingPurchases.value = true;
    const { data } = await useFetch(
      `/api/admin/purchases?page=${page}&limit=${limit}`
    );
    if (data.value) {
      console.log(data.value);
      stockPurchases.value = data.value.data;
      totalPurchases.value = data.value.total;
    }
  } catch (error) {
    console.error("Error fetching stock purchases:", error);
    showNotificationMessage($t("stock.errors.fetchPurchases"), "error");
  } finally {
    isLoadingPurchases.value = false;
  }
};

// Initial fetch
onMounted(() => {
  fetchProducts();
  fetchStockPurchases();
});

// Watch for page changes
watch(currentPage, (newPage) => {
  fetchStockPurchases(newPage, pageSize.value);
});

// Computed properties for pagination
const totalPages = computed(() =>
  Math.ceil(totalPurchases.value / pageSize.value)
);

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const selectedProduct = ref(null);
const crateQuantity = ref(1);
const quantity = ref(1);
const isLoading = ref(false);
const isSubmitting = ref(false);
const showNotification = ref(false);
const notificationType = ref("success");
const notificationMessage = ref("");
const { format, parse } = useMoney();

const newSpree = ref({
  productId: "",
  quantity: 1,
  price: 0,
  notes: "",
});

// Computed properties
const selectedProductPackSize = computed(() => {
  return selectedProduct.value?.packSize || 1;
});

const showCrateQuantity = computed(() => {
  return selectedProduct.value?.packSize > 1;
});

// Watch for product changes
watch(selectedProduct, (newProduct) => {
  if (newProduct) {
    newSpree.value.productId = newProduct.id;
    crateQuantity.value = 1;
    quantity.value = 1;
  }
});

// Methods
const submitStockPurchase = async () => {
  isSubmitting.value = true;

  try {
    const totalQuantity = showCrateQuantity.value
      ? crateQuantity.value * selectedProduct.value.packSize
      : quantity.value;

    const purchaseData = {
      productId: selectedProduct.value.id,
      quantity: totalQuantity,
      price: parse(newSpree.value.price),
      notes: newSpree.value.notes,
    };

    // Make API call to save the new stock purchase
    await $fetch("/api/admin/purchases", {
      method: "POST",
      body: purchaseData,
    });

    // Refresh the purchases list
    await fetchStockPurchases(currentPage.value, pageSize.value);

    // Reset form
    selectedProduct.value = null;
    newSpree.value = { productId: "", quantity: 1, price: 0, notes: "" };
    crateQuantity.value = 1;
    quantity.value = 1;

    showNotificationMessage($t("stock.purchaseAdded"), "success");
  } catch (error) {
    console.error("Error adding stock purchase:", error);
    showNotificationMessage($t("stock.errors.addFailed"), "error");
  } finally {
    isSubmitting.value = false;
  }
};

const getProductName = (purchaseProduct) => {
  const product = products.value.find((p) => p.id === purchaseProduct.id);
  return product ? product.name : "Unknown Product";
};

const formatDate = (dateString) => {
  console.log(dateString);
};

const showNotificationMessage = (message, type) => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 4000);
};
</script>
