<template>
  <!-- Page Title and Create Button -->
  <CTitle :text="$t('products.title')" />
  <div class="flex justify-between items-center mb-2">
    <BackLink to="/admin" :back-page="$t('admin.title')" />

    <div class="">
      <DashboardLink
        to="/admin/products/create"
        class="h-min"
        :label="$t('products.createProduct')"
      />
    </div>
  </div>

  <!-- Filters and Sorting -->
  <div class="flex w-full flex-wrap">
    <input
      v-model="searchQuery"
      :placeholder="$t('Search') + '...'"
      class="flex-grow px-3 py-2 mb-4 me-4 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    />

    <select
      v-model="selectedCategory"
      class="px-3 py-2 mb-4 me-4 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
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
  </div>

  <!-- Products Table -->
  <DataTable
    :columns="[
      {
        header: $t('Name'),
        field: 'name',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('Description'),
        field: 'description',
        align: 'left',
        sortable: false,
      },
      {
        header: $t('price'),
        field: 'price',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('stock'),
        field: 'stock',
        align: 'left',
        sortable: true,
      },
      {
        header: $t('actions'),
        field: 'actions',
        align: 'right',
        sortable: false,
      },
    ]"
    :data="
      filteredAndSortedProducts.map((product) => ({
        ...product,
        price: format(product.price),
        actions: '',
      }))
    "
    :sort-field="sortBy"
    :sort-direction="sortDirection"
    :no-data-text="$t('products.noProducts')"
    @sort="handleSort"
  >
    <template #cell-description="{ row: product }">
      <div class="text-sm text-gray-500 dark:text-gray-300">
        {{ product.description }}
      </div>
    </template>

    <template #cell-stock="{ row: product }">
      <div
        :class="{
          'text-red-600 dark:text-red-400 font-semibold': product.stock <= 0,
          'text-gray-900 dark:text-white': product.stock > 0,
        }"
      >
        {{ product.stock }}
      </div>
    </template>

    <template #cell-actions="{ row: product }">
      <div class="flex justify-end space-x-2">
        <button
          class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
          @click="editProduct(product)"
        >
          {{ $t("edit") }}
        </button>
        <button
          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
          @click="openDeleteConfirmation(product)"
        >
          {{ $t("delete") }}
        </button>
      </div>
    </template>

    <template #empty>
      <div class="text-center py-12 px-4 sm:px-6 lg:px-8">
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
    </template>
  </DataTable>
  <!-- Delete Confirmation Modal -->
  <DeleteConfirmationModal
    :is-open="isDeleteModalOpen"
    :title="$t('delete') + ' ' + $t('Product')"
    :message="`${$t('products.confirmDelete')} '${productToDelete?.name}'? ${$t(
      'cannotBeUndone'
    )}`"
    :confirm-text="$t('delete')"
    :cancel-text="$t('cancel')"
    @close="closeDeleteConfirmation"
    @confirm="confirmDelete"
  />
</template>

<script setup>
import DeleteConfirmationModal from "@/components/ConfirmDelete.vue";
import DataTable from "~/components/DataTable.vue";

const { format } = useMoney();

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

// Handle sort event from DataTable
const handleSort = ({ field, direction }) => {
  sortBy.value = field;
  sortDirection.value = direction;
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
