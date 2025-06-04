<template>
  <div>
    <CTitle title="Add Stock" />
    <BackLink to="/admin/products" />

    <form @submit.prevent="handleAddStock" class="mt-4 space-y-4">
      <div>
        <label for="product-select" class="block text-sm font-medium text-gray-700">Select Product</label>
        <select id="product-select" v-model="selectedProductId" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option :value="null" disabled>-- Please select a product --</option>
          <option v-for="product in productsList" :key="product._id" :value="product._id">
            {{ product.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="quantity-to-add" class="block text-sm font-medium text-gray-700">Quantity to Add</label>
        <input type="number" id="quantity-to-add" v-model.number="quantityToAdd" min="1" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>

      <div>
        <CButton type="submit" variant="primary">Add Stock</CButton>
      </div>
    </form>

    <p v-if="successMessage" class="mt-4 text-green-500">{{ successMessage }}</p>
    <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CTitle from '@/components/CTitle.vue';
import CButton from '@/components/CButton.vue';
import BackLink from '@/components/BackLink.vue';

const selectedProductId = ref(null);
const quantityToAdd = ref(1);
const productsList = ref([]);
const successMessage = ref('');
const errorMessage = ref('');

// Define a global $fetch for Nuxt 3 if not automatically available
// This is usually available globally in Nuxt 3 setups.
// If running in a different context or if there are issues, ensure $fetch is correctly polyfilled or imported.
const {$fetch} = useNuxtApp();

onMounted(async () => {
  try {
    // Assuming an endpoint /api/products or similar that lists all products
    // Adjust if your actual API endpoint for fetching all products is different
    const products = await $fetch('/api/products/all', { method: 'GET' });
    productsList.value = products;
    if (products.length > 0 && selectedProductId.value === null) {
      // Optionally pre-select the first product or leave as null for explicit user selection
      // selectedProductId.value = products[0]._id;
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    errorMessage.value = 'Failed to load products list. Please try again later.';
  }
});

const handleAddStock = async () => {
  successMessage.value = '';
  errorMessage.value = '';

  if (!selectedProductId.value) {
    errorMessage.value = 'Please select a product.';
    return;
  }
  if (quantityToAdd.value <= 0) {
    errorMessage.value = 'Please enter a quantity greater than 0.';
    return;
  }

  try {
    await $fetch('/api/admin/products/addstock', {
      method: 'POST',
      body: {
        productId: selectedProductId.value,
        quantity: quantityToAdd.value,
      },
    });
    successMessage.value = 'Stock added successfully!';
    // Reset form
    selectedProductId.value = null;
    quantityToAdd.value = 1;
    // Optionally, refetch products or the specific product to update UI if needed elsewhere
  } catch (error) {
    console.error('Error adding stock:', error);
    if (error.response && error.response._data && error.response._data.statusMessage) {
      errorMessage.value = error.response._data.statusMessage;
    } else {
      errorMessage.value = 'An unexpected error occurred while adding stock.';
    }
  }
};
</script>

<style scoped>
/* Basic styling, can be enhanced with more Tailwind classes as needed */
</style>
