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
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            :class="priceError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''"
            @blur="validatePrice"
          >
          <p
            v-if="priceError"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ priceError }}
          </p>
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
          {{ $t("stock") }}
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
          {{ $t("categories.categories") }}
        </label>
        <CMultiSelect
          v-model="formData.categories"
          :items="availableCategories"
          :placeholder="$t('categories.selectCategories')"
          item-text="name"
          item-value="_id"
          class="w-full"
        />
      </div>

      <!-- Product Image -->
      <div class="mt-4">
        <label
          class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          for="productImage"
        >
          {{ $t("products.productImage") }}
        </label>
        <div class="relative">
          <label 
            for="productImage"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Choose Image
          </label>
          <input
            id="productImage"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          >
        </div>
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
import { ref, onMounted, onUnmounted, watch } from "vue"; // Added onUnmounted
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
const priceError = ref("");

// Fetch categories on component mount
onMounted(async () => {
  try {
    // Fetch all available categories
    availableCategories.value = await $fetch("/api/categories/all", {
      method: "GET",
    });

    // Fetch product data if editing
    if (productId.value !== null) {
      const product = await $fetch(`/api/products/${productId.value}`, {
        method: "GET",
      });
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
      // For new product
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

const pricePattern = /^\d+(?:[.,]\d{1,2})?$/;

const validatePrice = () => {
  const rawPrice = formData.value.price;

  if (rawPrice === null || rawPrice === undefined || rawPrice === "") {
    priceError.value = "Price is required.";
    return false;
  }

  const normalizedPrice = String(rawPrice).replace(",", ".");

  if (!pricePattern.test(normalizedPrice)) {
    priceError.value = "Enter a valid price using up to two decimals.";
    return false;
  }

  const parsedPrice = parse(rawPrice);

  if (parsedPrice <= 0) {
    priceError.value = "Price must be greater than zero.";
    return false;
  }

  priceError.value = "";
  return true;
};

watch(
  () => formData.value.price,
  () => {
    if (priceError.value) {
      validatePrice();
    }
  }
);

// Save product method (create or update)
const saveProduct = async () => {
  try {
    if (!validatePrice()) {
      return;
    }

    const finalProductData = { ...formData.value };

    if (formData.value.imageFile) {
      const imageFormData = new FormData();
      imageFormData.append("image", formData.value.imageFile);

      const uploadResponse = await $fetch("/api/upload/image", {
        method: "POST",
        body: imageFormData,
      });
      finalProductData.imageUrl = uploadResponse.imageUrl;
    }

    delete finalProductData.imageFile;

    finalProductData.price = parse(finalProductData.price);

    if (
      finalProductData.categories &&
      Array.isArray(finalProductData.categories)
    ) {
      finalProductData.categories = finalProductData.categories.map((cat) =>
        typeof cat === "object" && cat._id ? cat._id : cat
      );
    }

    await $fetch("/api/admin/products/update", {
      method: "POST",
      body: JSON.stringify({
        id: productId.value,
        ...finalProductData,
      }),
    });

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
