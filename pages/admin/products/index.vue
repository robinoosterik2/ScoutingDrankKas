<template>
  <!-- Page Title and Create Button -->
  <CTitle :text="$t('products.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :backPage="$t('admin.title')"></BackLink>

    <div class="">
      <DashboardLink
        to="/admin/products/create"
        class="h-min"
        :label='$t("products.createProduct")'
      />
    </div>
  </div>

  <!-- Filters and Sorting -->
  <div class="mb-4 flex space-x-4">
    <!-- Search Input -->
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    />

    <select
      v-model="selectedCategory"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white text-sm"
    >
      <option value="">{{ $t("categories.allCategories") }}</option>
      <option
        v-for="category in categories"
        :key="category._id"
        :value="category._id"
      >
        {{ category.name }}
      </option>
    </select>

    <select
      v-model="sortBy"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
      <option value="name">{{ $t("sortBy") }} {{ $t("name") }}</option>
      <option value="price">{{ $t("sortBy") }} {{ $t("price") }}</option>
      <option value="stock">{{ $t("sortBy") }} {{ $t("stock") }}</option>
    </select>

    <button
      @click="toggleSortDirection"
      class="px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
    >
      {{ sortDirection === "asc" ? "▲" : "▼" }}
    </button>
  </div>
  <!-- Products Table -->
  <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead class="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("Name") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("Description") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("price") }}
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
          >
            {{ $t("stock") }}
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
          v-for="product in filteredAndSortedProducts"
          :key="product._id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ product.name }}
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ product.description }}
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-900 dark:text-white">
              {{ product.price | currency }}
            </div>
          </td>
          <td class="px-6 py-4">
            <div class="text-sm text-gray-500 dark:text-gray-300">
              {{ product.stock }}
            </div>
          </td>
          <td
            class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
          >
            <div class="flex justify-end space-x-2">
              <button
                @click="editProduct(product)"
                class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
              >
                {{ $t("edit") }}
              </button>
              <button
                @click="openDeleteConfirmation(product)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
              >
                {{ $t("delete") }}
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Empty State -->
    <div
      v-if="filteredAndSortedProducts.length === 0"
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
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t("products.noProducts") }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ $t("products.getStarted") }}
      </p>
    </div>
  </div>
  <!-- Delete Confirmation Modal -->
  <DeleteConfirmationModal
    :isOpen="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('Product')"
    :message="`${$t('products.confirmDelete')} '${productToDelete?.name}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirmText="$t('delete')"
    :cancelText="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";

const categories = ref([]);
const products = ref([]);
const searchQuery = ref("");
const selectedCategory = ref("");
const sortBy = ref("name");
const sortDirection = ref("asc");

try {
  categories.value = await $fetch("/api/categories/all", { method: "GET" });
  products.value = await $fetch("/api/products/all", { method: "GET" });
} catch (error) {
  console.error("Failed to fetch products:", error);
  alert("Failed to fetch products. Please try again.");
}

const filteredAndSortedProducts = computed(() => {
  return products.value
    .filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        product.description
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());

      // Category filter
      const matchesCategory =
        !selectedCategory.value ||
        product.categories.includes(selectedCategory.value);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const direction = sortDirection.value === "asc" ? 1 : -1;
      if (sortBy.value === "name") {
        if (a.name < b.name) return -1 * direction;
        if (a.name > b.name) return 1 * direction;
      } else if (sortBy.value === "price") {
        return (a.price - b.price) * direction;
      } else if (sortBy.value === "stock") {
        return (a.stock - b.stock) * direction;
      }
      return 0;
    });
});

// Edit product method (navigate to edit page)
const editProduct = (product) => {
  navigateTo(`/admin/products/edit/${product._id}`);
};

// Delete confirmation modal state
const isDeleteModalOpen = ref(false);
const productToDelete = ref(null);

// Open delete confirmation modal
const openDeleteConfirmation = (product) => {
  productToDelete.value = product;
  isDeleteModalOpen.value = true;
};

// Close delete confirmation modal
const closeDeleteConfirmation = () => {
  isDeleteModalOpen.value = false;
  productToDelete.value = null;
};

// Toggle sort direction
const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
};

const deleteProduct = async (productId) => {
  try {
    await $fetch(`/api/admin/products/delete`, {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
    products.value = products.value.filter(
      (product) => product._id !== productId
    );
  } catch (error) {
    alert("Failed to delete product. Please try again.");
  }
};

// Confirm delete action
const confirmDelete = () => {
  if (productToDelete.value) {
    deleteProduct(productToDelete.value._id);
    closeDeleteConfirmation();
  }
};
</script>
