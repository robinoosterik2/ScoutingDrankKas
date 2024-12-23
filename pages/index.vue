<template>
  <div class="container mx-auto px-4 py-2">
    <!-- Select User -->
    <div class="mb-2">
      <div class="flex items-center">
        <div class="flex-1">
          <CSelect
            v-model="selectedUser"
            :users="users"
            :placeholder="$t('orders.selectUser')"
          />
        </div>
        <!-- Order Button -->
        <div class="flex justify-end ms-2">
          <button
            :disabled="!selectedUser || totalSelectedProducts === 0"
            @click="showConfirmation = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ $t("orders.placeOrder") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Select Products -->
    <div class="">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {{ $t("orders.selectProducts") }}
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="product in products"
          :key="product.id"
          class="cursor-pointer border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative"
        >
          <!-- <img
            :src="product.imageUrl"
            :alt="product.name"
            class="h-24 w-full object-cover rounded mb-2"
          /> -->
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ product.name }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            €{{ product.price }}
          </p>
          <div class="mt-2 flex items-center justify-between">
            <button
              @click="decrementProduct(product)"
              class="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
              :disabled="getProductCount(product) === 0"
            >
              -
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              {{ getProductCount(product) }}
            </span>
            <button
              @click="incrementProduct(product)"
              class="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
    <OrderConfirmationDialog
      :show="showConfirmation"
      :products="products"
      :product-counts="productCounts"
      :get-product-count="getProductCount"
      :increment-product="incrementProduct"
      :decrement-product="decrementProduct"
      @close="showConfirmation = false"
      @confirm="placeOrder"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const users = ref([]);
const products = ref([]);
const selectedUser = ref(null);
const productCounts = ref({});
const showConfirmation = ref(false);

onMounted(async () => {
  try {
    users.value = await $fetch("/api/users/all", { method: "GET" });
    products.value = await $fetch("/api/products/ordered", { method: "GET" });

    products.value.forEach((product) => {
      productCounts.value[product.id] = 0;
    });
  } catch (error) {
    console.error("Failed to fetch users or products:", error);
    alert("Failed to fetch data. Please try again.");
  }
});

const getProductCount = (product) => productCounts.value[product.id] || 0;

const incrementProduct = (product) => {
  productCounts.value[product.id] += 1;
};

watch(selectedUser, (newValue) => {
  console.log("Selected user:", newValue);
});

const decrementProduct = (product) => {
  if (productCounts.value[product.id] > 0) {
    productCounts.value[product.id] -= 1;
  }
};

const totalSelectedProducts = computed(() => {
  return Object.values(productCounts.value).reduce(
    (total, count) => total + count,
    0
  );
});

const placeOrder = async () => {
  const selectedProducts = Object.entries(productCounts.value)
    .filter(([_, count]) => count > 0)
    .map(([productId, count]) => ({ productId, count }));

  try {
    await $fetch("/api/orders/create", {
      method: "POST",
      body: JSON.stringify({
        userId: selectedUser.value,
        products: selectedProducts,
      }),
    });

    showConfirmation.value = false;
    selectedUser.value = null;
    Object.keys(productCounts.value).forEach(
      (key) => (productCounts.value[key] = 0)
    );
  } catch (error) {
    console.error("Failed to place order: ", error);
    alert("Failed to place order. Please try again.: ", error);
  }
};
</script>
