<template>
  <div class="container px-4 py-2 mx-auto">
    <!-- Back to Products Button -->
    <CTitle
      :text="
        productId ? $t('products.editProduct') : $t('products.createProduct')
      "
    />
    <BackLink to="/admin/products" back-page="Products" />

    <!-- Edit Product Form -->
    <form
      class="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-md dark:bg-gray-800"
      @submit.prevent="saveProduct"
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
            id="productName"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
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
            id="productPrice"
            v-model="formData.price"
            type="number"
            min="0"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
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
          id="productDescription"
          v-model="formData.description"
          required
          class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          rows="3"
        />
      </div>

      <!-- Product Stock -->
      <div class="mt-4">
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          for="productStock"
        >
          {{ $t("products.productStock") }}
        </label>
        <input
          id="productStock"
          v-model="formData.stock"
          type="number"
          min="0"
          required
          class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
      </div>

      <!-- Pack Size (Optional) -->
      <div class="mt-4">
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          for="productPackSize"
        >
          {{ $t("products.packSize") }} ({{ $t("common.optional") }})
        </label>
        <input
          id="productPackSize"
          v-model.number="formData.packSize"
          type="number"
          min="1"
          class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          :placeholder="$t('products.packSizePlaceholder')"
        >
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t("products.packSizeHelp") }}
        </p>
      </div>

      <!-- Product Categories -->
      <div class="mt-4">
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ $t("products.categories") }}
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
          id="productImage"
          type="file"
          accept="image/*"
          class="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 dark:file:bg-indigo-500 dark:hover:file:bg-indigo-600"
          @change="handleImageUpload"
        >
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t("products.imageAspectRatioTip") }}
        </p>
        <!-- Image Preview -->
        <div v-if="formData.imageUrl" class="mt-2">
          <img
            :src="formData.imageUrl"
            alt="Product Image Preview"
            class="object-cover w-32 rounded aspect-video"
          >
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mt-6 space-x-4">
        <button
          type="button"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          @click="navigateTo('/admin/products')"
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
import { ref, onMounted, onUnmounted } from "vue";
const { parse } = useMoney();

// Get product ID from route
const route = useRoute();
const initialProductId = route.params.id;
const productId = ref(
  initialProductId !== undefined
    ? (() => {
        const parsed = Number.parseInt(String(initialProductId), 10);
        return Number.isNaN(parsed) ? null : parsed;
      })()
    : null
);

// Available categories state
const availableCategories = ref([]);

// Form data reactive state
const formData = ref({
  name: "",
  description: "",
  price: null,
  stock: 0,
  packSize: null, // Optional pack size (e.g., 24 for a crate of beer)
  categories: [],
  imageUrl: "/images/placeholder.jpg", // Default for display
  imageFile: null, // To store the actual File object for new uploads
});

const originalImageUrl = ref("/images/placeholder.jpg"); // Store the initial/fetched image URL

// Fetch categories on component mount
onMounted(async () => {
  try {
    // Fetch all available categories
    availableCategories.value = await $fetch("/api/categories/all", {
      method: "GET",
    });
    console.log(productId.value)
    // Fetch product data if editing
    if (productId.value !== null) {
      const product = await $fetch(`/api/products/${productId.value}`, {
        method: "GET",
      });
      console.log(product)
      formData.value = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categories: product.categories.map((cat) =>
          typeof cat === "object" ? cat._id : cat
        ), // Ensure categories are IDs
        imageUrl: product.imageUrl || "/images/placeholder.jpg",
        imageFile: null, // Reset on load
      };
      originalImageUrl.value = product.imageUrl || "/images/placeholder.jpg";
    } else {
      // Fallback for placeholder if somehow productId is not available
      formData.value.imageUrl = "/images/placeholder.jpg";
      originalImageUrl.value = "/images/placeholder.jpg";
    }
  } catch (error) {
    console.error("Failed to fetch categories or product:", error);
    alert("Failed to fetch categories or product details. Please try again.");
  }
});

onUnmounted(() => {
  if (formData.value.imageUrl && formData.value.imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(formData.value.imageUrl);
  }
});

const handleImageUpload = (event) => {
  // Revoke previous blob URL if it exists
  if (formData.value.imageUrl && formData.value.imageUrl.startsWith("blob:")) {
    URL.revokeObjectURL(formData.value.imageUrl);
  }

  const file = event.target.files[0];
  if (file) {
    formData.value.imageFile = file; // Store the actual file
    formData.value.imageUrl = URL.createObjectURL(file); // Preview new image
  } else {
    formData.value.imageFile = null;
    formData.value.imageUrl = originalImageUrl.value; // Revert to original/placeholder on cancel
  }
};

// Save product method (create or update)
const saveProduct = async () => {
  try {
    const finalProductData = { ...formData.value };

    if (formData.value.imageFile) {
      // A new file is staged for upload
      const imageFormData = new FormData();
      imageFormData.append("image", formData.value.imageFile);

      const uploadResponse = await $fetch("/api/upload/image", {
        method: "POST",
        body: imageFormData,
      });
      finalProductData.imageUrl = uploadResponse.imageUrl; // Update with the new server URL
    }
    // If no imageFile, finalProductData.imageUrl already holds the correct URL (original or placeholder)

    // Remove imageFile from payload as it's not part of the Product model schema for this endpoint
    delete finalProductData.imageFile;

    // Ensure categories are an array of IDs
    if (
      finalProductData.categories &&
      Array.isArray(finalProductData.categories)
    ) {
      finalProductData.categories = finalProductData.categories.map((cat) =>
        typeof cat === "object" && cat._id ? cat._id : cat
      );
    }

    finalProductData.price = parse(finalProductData.price);

    await $fetch("/api/admin/products/update", {
      method: "POST",
      body: JSON.stringify({
        id: productId.value,
        ...finalProductData,
      }),
    });

    // Redirect back to products list after successful save
    navigateTo("/admin/products");
  } catch (error) {
    console.error("Failed to save product:", error);
    const errorMessage =
      error.data?.body?.message ||
      error.data?.message ||
      error.message ||
      "Failed to save product. Please try again.";
    alert(errorMessage);
  }
};
</script>
