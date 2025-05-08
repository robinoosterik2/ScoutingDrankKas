<template>
  <div class="container px-4 py-2 mx-auto">
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
            class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            @click="showConfirmation = true"
          >
            {{ $t("orders.placeOrder") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center mb-4 space-x-4">
      <!-- Search Bar -->
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('orders.searchProducts')"
        class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
      <div class="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4 xl:grid-cols-5">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="relative flex flex-col justify-between p-4 transition-shadow bg-white border rounded-lg cursor-pointer dark:bg-gray-800 hover:shadow-md"
        >
          <img
            :src="getDisplayableProductImageUrl(product.imageUrl)"
            :alt="product.name"
            class="object-cover w-full rounded aspect-video"
          >
          <div class="flex items-center justify-between mt-4 align-middle">
            <h3 class="text-2xl text-gray-700 dark:text-gray-300 ">
              {{ product.name }}
            </h3>
            <p class="text-xl text-gray-500 dark:text-gray-400">
              €{{ product.price }}
            </p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <button
              class="flex items-center justify-center w-24 h-10 text-white bg-red-500 rounded-full"
              :disabled="getProductCount(product) === 0"
              @click="decrementProduct(product)"
            >
              <div class="text-2xl">-</div>
            </button>
            <span class="text-2xl text-gray-700 dark:text-gray-300">
              {{ getProductCount(product) }}
            </span>
            <button
              class="flex items-center justify-center w-24 h-10 text-white bg-green-500 rounded-full"
              @click="incrementProduct(product)"
            >
            <div class="text-2xl">+</div>              
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
import { getDisplayableProductImageUrl } from "@/utils/imageUtils"; // Import the utility function

const users = ref([]);
const products = ref([]);
const categories = ref([]);
const selectedUser = ref(null);
const productCounts = ref({});
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

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());
    const matchesCategory =
      !selectedCategory.value ||
      product.categories.includes(selectedCategory.value);
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
  } catch (error) {
    console.error("Failed to place order: ", error);
    alert("Failed to place order. Please try again.: ", error);
  }
};
</script>
