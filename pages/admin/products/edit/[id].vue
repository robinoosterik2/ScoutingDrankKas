<template>
    <div class="container mx-auto px-4 py-2">
      <!-- Back to Products Button -->
      <CTitle :text="productId ? $t('products.editProduct') : $t('products.createProduct')" />
      <BackLink to="/admin/products" backPage="Products"></BackLink>
  
      <!-- Edit Product Form -->
      <form
        @submit.prevent="saveProduct"
        class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 max-w-xl mx-auto"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- Product Name -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              for="productName"
            >
              {{ $t("products.productName") }}
            </label>
            <input
              v-model="formData.name"
              type="text"
              id="productName"
              required
              class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
  
          <!-- Product Price -->
          <div>
            <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              for="productPrice"
            >
              {{ $t("products.productPrice") }}
            </label>
            <input
              v-model="formData.price"
              type="number"
              id="productPrice"
              min="0"
              required
              class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
  
        <!-- Product Description -->
        <div class="mt-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="productDescription"
          >
            {{ $t("products.productDescription") }}
          </label>
          <textarea
            v-model="formData.description"
            id="productDescription"
            required
            class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
            rows="3"
          ></textarea>
        </div>
  
        <!-- Product Stock -->
        <div class="mt-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            for="productStock"
          >
            {{ $t("products.productStock") }}
          </label>
          <input
            v-model="formData.stock"
            type="number"
            id="productStock"
            min="0"
            required
            class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          />
        </div>
  
        <!-- Product Categories -->
        <div class="mt-4">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {{ $t("products.categories") }}
          </label>
          <select
            v-model="formData.categories"
            multiple
            class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
          >
            <option
              v-for="category in availableCategories"
              :key="category._id"
              :value="category._id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
  
        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            @click="navigateTo('/admin/products')"
            class="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {{ productId ? "Update Product" : "Create Product" }}
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  
  // Get product ID from route
  const route = useRoute();
  const productId = ref(route.params.id || null);
  
  // Available categories state
  const availableCategories = ref([]);
  
  // Form data reactive state
  const formData = ref({
    name: "",
    description: "",
    price: null,
    stock: 0,
    categories: [],
  });
  
  // Fetch categories on component mount
  onMounted(async () => {
    try {
      // Fetch all available categories
      availableCategories.value = await $fetch("/api/categories/all", { method: "GET" });
  
      // Fetch product data if editing
      if (productId.value) {
        const product = await $fetch(`/api/products/${productId.value}`, {
          method: "GET",
        });
        formData.value = {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categories: product.categories,
        };
      }
    } catch (error) {
      console.error("Failed to fetch categories or product:", error);
      alert("Failed to fetch categories or product details. Please try again.");
    }
  });
  
  // Save product method (create or update)
  const saveProduct = async () => {
    try {
      await $fetch("/api/admin/products/update", {
        method: "POST",
        body: JSON.stringify({
          id: productId.value,
          ...formData.value,
        }),
      });
  
      // Redirect back to products list after successful save
      navigateTo("/admin/products");
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(error.message || "Failed to save product. Please try again.");
    }
  };
  </script>
  