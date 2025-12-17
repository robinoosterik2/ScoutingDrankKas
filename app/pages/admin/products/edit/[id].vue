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
            id="productPrice"
            v-model="formData.price"
            type="text"
            required
            class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            :class="
              priceError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : ''
            "
            @blur="validatePrice"
          />
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
          {{ $t("products.productStock") }}
        </label>
        <input
          id="productStock"
          v-model="formData.stock"
          type="number"
          min="0"
          required
          class="w-full px-3 py-2 border rounded-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
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
        />
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
        <CMultiSelect
          v-model="formData.categories"
          :items="availableCategories"
          :placeholder="$t('categories.selectCategories')"
          item-text="name"
          item-value="id"
          class="w-full"
          :class="categoryError ? 'border-red-500' : ''"
        />
        <p
          v-if="categoryError"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ categoryError }}
        </p>
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
        />
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t("products.imageAspectRatioTip") }}
        </p>
        <!-- Image Preview -->
        <div v-if="formData.imageUrl" class="mt-2">
          <img
            :src="formData.imageUrl"
            alt="Product Image Preview"
            class="object-cover w-32 rounded aspect-video"
          />
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
import { ref, onMounted, onUnmounted, watch } from "vue";
const { parse, toEuro } = useMoney();

// Get product ID from route
const route = useRoute();
const initialProductId = route.params.id;
const productId = ref(
  initialProductId !== undefined &&
    initialProductId !== "new" &&
    initialProductId !== "create"
    ? String(initialProductId)
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
const categoryError = ref("");

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
        price: toEuro(product.price),
        stock: product.stock,
        categories: product.categories.map((cat) =>
          typeof cat === "object" ? cat.categoryId ?? cat.id : cat
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

const validateCategory = () => {
  if (!formData.value.categories || formData.value.categories.length === 0) {
    categoryError.value = "Category is required.";
    return false;
  }
  categoryError.value = "";
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

watch(
  () => formData.value.categories,
  () => {
    if (categoryError.value) {
      validateCategory();
    }
  }
);

// Save product method (create or update)
const saveProduct = async () => {
  try {
    if (!validatePrice()) {
      return;
    }
    if (!validateCategory()) {
      return;
    }
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
      finalProductData.categories = finalProductData.categories
        .map((cat) => (typeof cat === "object" && cat.id ? cat.id : cat))
        .filter((cat) => cat !== null && cat !== undefined);
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
