<template>
  <div class="container px-4 py-2 mx-auto">
    <!-- User Info Display -->
    <div v-if="user" class="mb-4 text-right">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ $t("auth.loggedInAs") }}: {{ user.firstName }} {{ user.lastName }}
      </p>
    </div>
    <!-- Recent Orders (shown when no user is selected) -->
    <div class="mb-8">
      <h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
        {{
          selectedUser
            ? $t("orders.userRecentOrders", {
                name: users.find((u) => u.id === selectedUser)?.firstName || "",
              })
            : $t("orders.recentOrders")
        }}
      </h2>
      <div v-if="recentOrders.length > 0" class="grid gap-4 md:grid-cols-3">
        <div
          v-for="order in recentOrders"
          :key="order.id"
          class="p-4 bg-white rounded-lg shadow dark:bg-gray-800"
        >
          <div class="flex justify-between mb-2">
            <h3 class="font-medium text-gray-700 dark:text-gray-300">
              <!-- if no firstname and lastname use username -->
              <span v-if="order.user?.firstName && order.user?.lastName">
                {{ order.user?.firstName }} {{ order.user?.lastName }}
              </span>
              <span v-else>{{ order.user?.username }}</span>
            </h3>
            <span class="text-sm">{{ formatDate(order.createdAt) }}</span>
          </div>
          <ul class="mb-3 space-y-1">
            <li
              v-for="item in order.products"
              :key="item.productId"
              class="flex justify-between text-sm"
            >
              <span class="text-gray-600 dark:text-gray-400"
                >{{ item.count }}x {{ item.productId.name }}</span
              >
              <span class="text-gray-800 dark:text-gray-200">{{
                format(item.productId.price * item.count)
              }}</span>
            </li>
          </ul>
          <button
            class="w-full px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700"
            @click="reorderItems(order.products, order)"
          >
            {{ $t("orders.quickReorder") }}
          </button>
        </div>
      </div>
      <p v-else class="text-gray-500 dark:text-gray-400">
        {{ $t("orders.noRecentOrders") }}
      </p>
    </div>

    <!-- Select User -->
    <div class="mb-2">
      <div class="flex items-center">
        <div class="flex-1">
          <CSelect
            ref="userSelectRef"
            v-model="selectedUser"
            :items="users"
            :placeholder="$t('orders.selectUser')"
            item-text="dropdownLabel"
            item-value="id"
            :search-keys="[
              'dropdownLabel',
              'username',
              'firstName',
              'lastName',
              'email',
            ]"
            @update:model-value="
              (val) => {
                selectedUser = val || null;
              }
            "
            @number-key="handleNumberKeys"
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
        ref="productSearchRef"
        v-model="searchQuery"
        type="text"
        :placeholder="$t('orders.searchProducts')"
        class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        @keydown.enter.exact="addFirstProduct"
        @keydown.enter.shift="placeOrderIfReady"
        @keydown.enter.ctrl="decrementFirstProduct"
        @keydown.escape="clearProductSearch"
        @keydown="handleNumberKeys"
      />
      <!-- Category Filter -->
      <select
        v-model="selectedCategory"
        class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="">{{ $t("orders.allCategories") }}</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Select Products -->
    <div class="">
      <div
        class="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4 xl:grid-cols-5"
      >
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          :count="getProductCount(product)"
          @increment="incrementProduct"
          @decrement="decrementProduct"
        />
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
import { ref, onMounted, computed, watch, nextTick } from "vue";
import ProductCard from "@/components/ProductCard.vue";

const { user } = useUserSession();
const { format } = useMoney();

// Reactive state
const users = ref([]);
const products = ref([]);
const categories = ref([]);
const recentOrders = ref([]);
const selectedUser = ref(null);
const showConfirmation = ref(false);
const searchQuery = ref("");
const selectedCategory = ref("");
const productCounts = ref({});
const userSelectRef = ref(null);
const productSearchRef = ref(null);

// Watch for changes in selected user
watch(selectedUser, async () => {
  await fetchRecentOrders();
  // Focus product search when user is selected
  if (selectedUser.value) {
    nextTick(() => {
      if (productSearchRef.value) {
        productSearchRef.value.focus();
      }
    });
  }
});

const fetchRecentOrders = async () => {
  try {
    const query = {};
    const userObj = users.value.find((u) => u.id === selectedUser.value);

    if (userObj) {
      if (userObj.type === "guest") {
        query.guestId = userObj.id;
      } else {
        query.userId = userObj.id;
      }
    }

    const response = await $fetch("/api/orders/recent", {
      method: "GET",
      query,
    });
    recentOrders.value = response.orders || [];
  } catch (error) {
    console.error("Failed to fetch recent orders:", error);
  }
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const reorderItems = (items, order) => {
  // Set the user who made the original order
  if (order?.user?.id) {
    selectedUser.value = String(order.user.id);
  }

  // Reset current order
  Object.keys(productCounts.value).forEach((key) => {
    productCounts.value[key] = 0;
  });

  // Set new quantities from the selected order
  items.forEach((item) => {
    if (item.productId && item.productId.id) {
      productCounts.value[item.productId.id] = item.count;
    }
  });

  // Show confirmation dialog if we have items to order
  if (items.length > 0) {
    showConfirmation.value = true;
  }
};

onMounted(async () => {
  try {
    const [usersResponse, productsResponse, categoriesResponse] =
      await Promise.all([
        $fetch("/api/users/all", { method: "GET" }),
        $fetch("/api/products/ordered", { method: "GET" }),
        $fetch("/api/categories/all", { method: "GET" }),
      ]);

    users.value = usersResponse;
    products.value = productsResponse;
    categories.value = categoriesResponse;

    products.value.forEach((product) => {
      productCounts.value[product.id] = 0;
    });

    await fetchRecentOrders();

    // Auto-focus the user select after data is loaded
    nextTick(() => {
      if (userSelectRef.value) {
        userSelectRef.value.focusInput();
      }
    });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    alert("Failed to fetch data. Please try again.");
  }
});

const getProductCount = (product) => productCounts.value[product.id] || 0;

const incrementProduct = (product) => {
  productCounts.value[product.id] += 1;
  // Keep focus on product search for fast ordering
  nextTick(() => {
    if (productSearchRef.value) {
      productSearchRef.value.focus();
    }
  });
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

const addFirstProduct = () => {
  if (filteredProducts.value.length > 0) {
    const firstProduct = filteredProducts.value[0];
    incrementProduct(firstProduct);
    // Keep the search term so you can add more of the same product
  }
};

const decrementFirstProduct = () => {
  if (filteredProducts.value.length > 0) {
    const firstProduct = filteredProducts.value[0];
    decrementProduct(firstProduct);
    // Keep the search term so you can remove more of the same product
  }
};

const clearProductSearch = () => {
  searchQuery.value = "";
  if (productSearchRef.value) {
    productSearchRef.value.blur();
  }
};

const handleNumberKeys = (event) => {
  // Only trigger if no search query and it's a number key 1, 2, or 3
  if (searchQuery.value === "" && ["1", "2", "3"].includes(event.key)) {
    event.preventDefault();
    const orderIndex = parseInt(event.key) - 1;

    if (recentOrders.value[orderIndex]) {
      const order = recentOrders.value[orderIndex];
      reorderItems(order.products, order);
    }
  }
};

const placeOrderIfReady = () => {
  // Check if we have a selected user and products
  if (selectedUser.value && totalSelectedProducts.value > 0) {
    showConfirmation.value = true;
  } else if (!selectedUser.value) {
    // Focus back to user select if no user selected
    nextTick(() => {
      if (userSelectRef.value) {
        userSelectRef.value.focusInput();
      }
    });
  }
  // If no products selected, just stay on product search (do nothing)
};

const placeOrder = async () => {
  const selectedProducts = Object.entries(productCounts.value)
    .filter(([_, count]) => count > 0)
    .map(([productId, count]) => ({ productId, count }));

  try {
    const userObj = users.value.find((u) => u.id === selectedUser.value);

    // Construct payload dynamically based on if it's a guest or user
    const payload = {
      products: selectedProducts,
    };

    if (userObj && userObj.type === "guest") {
      payload.guestId = userObj.id;
    } else {
      payload.userId = selectedUser.value;
    }

    await $fetch("/api/orders/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showConfirmation.value = false;
    selectedUser.value = null;
    Object.keys(productCounts.value).forEach(
      (key) => (productCounts.value[key] = 0)
    );

    // Auto-focus the user select again after placing order
    nextTick(() => {
      if (userSelectRef.value) {
        userSelectRef.value.focusInput();
      }
    });

    // Refresh recent orders
    await fetchRecentOrders();

    // Refresh products to show updated stock
    const productsResponse = await $fetch("/api/products/ordered", {
      method: "GET",
    });
    products.value = productsResponse;
  } catch (error) {
    console.error("Failed to place order: ", error);
    alert("Failed to place order. Please try again.");
  }
};
</script>
