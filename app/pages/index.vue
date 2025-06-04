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
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            @click="showConfirmation = true"
          >
            {{ $t("orders.placeOrder") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex items-center space-x-4">
      <!-- Search Bar -->
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('orders.searchProducts')"
        class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      >
      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
      >
        <option value="">{{ $t("orders.allCategories") }}</option>
        <option
          v-for="category in categories"
          :key="category._id"
          :value="category._id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Select Products -->
    <div class="">
      <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 xl:grid-cols-5">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="cursor-pointer border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative flex flex-col justify-between"
        >
          <img
            :src="product.imageUrl"
            :alt="product.name"
            class="h-24 w-full object-cover rounded"
          >
          <div class="flex align-middle items-center mt-4 justify-between">
            <h3 class="text-2xl text-gray-700 dark:text-gray-300 ">
              {{ product.name }}
            </h3>
            <p class="text-xl text-gray-500 dark:text-gray-400">
              €{{ product.price }}
            </p>
          </div>
          <div class="flex mt-2 items-center justify-between">
            <button
              class="bg-red-500 text-white rounded-full h-10 w-24 flex items-center justify-center"
              :disabled="getProductCount(product) === 0"
              @click="decrementProduct(product)"
            >
              <div class="text-2xl">-</div>
            </button>
            <span class="text-2xl text-gray-700 dark:text-gray-300">
              {{ getProductCount(product) }}
            </span>
            <button
              class="bg-green-500 text-white rounded-full h-10 w-24 flex items-center justify-center"
              @click="incrementProduct(product)"
            >
            <div class="text-2xl">+</div>              
            </button>
          </div>
          <!-- Crate Input Section -->
          <div class="flex mt-3 items-center justify-between space-x-2">
            <input
              type="number"
              v-model.number="crateCounts[product.id]"
              min="1"
              placeholder="Crates"
              class="w-20 px-2 py-1 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
            />
            <button
              @click="incrementProductByCrates(product, crateCounts[product.id])"
              :disabled="!crateCounts[product.id] || crateCounts[product.id] <= 0"
              class="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              Add Crates
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
const categories = ref([]);
const selectedUser = ref(null);
const productCounts = ref({});
const crateCounts = ref({}); // Added for crate counts
const CRATE_SIZE = 24; // Defined crate size
const showConfirmation = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");

onMounted(async () => {
  try {
    users.value = await $fetch("/api/users/all", { method: "GET" });
    products.value = await $fetch("/api/products/ordered", { method: "GET" });
    categories.value = await $fetch("/api/categories/all", { method: "GET" });

    products.value.forEach((product) => {
      productCounts.value[product.id] = 0;
      crateCounts.value[product.id] = ''; // Initialize crate count for each product
    });
  } catch (error) {
    console.error("Failed to fetch users, products, or categories:", error);
    alert("Failed to fetch data. Please try again.");
  }
});

const getProductCount = (product) => productCounts.value[product.id] || 0;

const incrementProduct = (product) => {
  productCounts.value[product.id] += 1;
};

const decrementProduct = (product) => {
  if (productCounts.value[product.id] > 0) {
    productCounts.value[product.id] -= 1;
  }
};

const incrementProductByCrates = (product, numberOfCrates) => {
  const numCrates = parseInt(numberOfCrates);
  if (numCrates > 0) {
    productCounts.value[product.id] += numCrates * CRATE_SIZE;
    crateCounts.value[product.id] = ''; // Reset crate input
  }
};

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesCategory =
      !selectedCategory.value ||
      product.categories.includes(selectedCategory.value);
    console.log("selectedCategory.value", selectedCategory.value);
    return matchesSearch && matchesCategory;
  });
});

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
    Object.keys(crateCounts.value).forEach(
      (key) => (crateCounts.value[key] = '') // Also reset crate counts
    );
  } catch (error) {
    console.error("Failed to place order: ", error);
    alert("Failed to place order. Please try again.: ", error);
  }
};
</script>
