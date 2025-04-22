<template>
    <div class="container px-4 py-2 mx-auto">
      <!-- Back to Products Button -->
      <CTitle :text="productId ? $t('products.editProduct') : $t('products.createProduct')" />
      <BackLink to="/admin/products" backPage="Products"></BackLink>
  
      <!-- Edit Product Form -->
      <form
        @submit.prevent="saveProduct"
        class="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800"
      >
        <div class="grid grid-cols-2 gap-4">
          <!-- Product Name -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              for="productName"
            >
              {{ $t("products.productName") }}
            </label>
            <input
              v-model="formData.name"
              type="text"
              id="productName"
              required
              class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
  
          <!-- Product Price -->
          <div>
            <label
              class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              for="productPrice"
            >
              {{ $t("products.productPrice") }}
            </label>
            <input
              v-model="formData.price"
              type="text"
              id="productPrice"
              required
              class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
  
        <!-- Product Description -->
        <div class="mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            for="productDescription"
          >
            {{ $t("products.productDescription") }}
          </label>
          <textarea
            v-model="formData.description"
            id="productDescription"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            rows="3"
          ></textarea>
        </div>
  
        <!-- Product Stock -->
        <div class="mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            for="productStock"
          >
            {{ $t("stock") }}
          </label>
          <input
            v-model="formData.stock"
            type="number"
            id="productStock"
            min="0"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
  
        <!-- Product Categories -->
        <div class="mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ $t("categories.categories") }}
          </label>
          <select
            v-model="formData.categories"
            multiple
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
  
        <!-- Product Image -->
        <div class="mt-4">
          <label
            class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            for="productImage"
          >
            {{ $t("products.productImage") }}
          </label>
          <input
            type="file"
            id="productImage"
            accept="image/*"
            @change="handleImageUpload"
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
  
        <!-- Action Buttons -->
        <div class="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            @click="navigateTo('/admin/products')"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
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
