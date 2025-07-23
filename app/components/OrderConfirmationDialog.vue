<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
    >
      <div class="p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
          {{ $t("confirm") }}
        </h2>
      </div>

      <div class="p-4 overflow-y-auto max-h-[60vh]">
        <div
          v-if="selectedProducts.length === 0"
          class="text-gray-500 dark:text-gray-400 text-center py-4"
        >
          {{ $t("orders.noProductsSelected") }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="product in selectedProducts"
            :key="product.id"
            class="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <img
                :src="product.imageUrl"
                :alt="product.name"
                class="h-16 w-16 object-cover rounded"
              />
              <div>
                <h3 class="font-medium text-gray-800 dark:text-white">
                  {{ product.name }}
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ format(product.price) }} × {{ getProductCount(product) }} =
                  {{ format(product.price * getProductCount(product)) }}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <button
                class="bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-600"
                :disabled="getProductCount(product) === 0"
                @click="decrementProduct(product)"
              >
                -
              </button>
              <span class="w-8 text-center text-gray-700 dark:text-gray-300">
                {{ getProductCount(product) }}
              </span>
              <button
                class="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-green-600"
                @click="incrementProduct(product)"
              >
                +
              </button>
            </div>
          </div>

          <div class="border-t dark:border-gray-700 pt-4 mt-4">
            <div class="flex justify-between text-lg font-semibold">
              <span class="text-gray-800 dark:text-white"
                >{{ $t("total") }}:</span
              >
              <span class="text-gray-800 dark:text-white">{{
                format(totalAmount)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
        <button
          class="px-4 py-2 border dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          {{ $t("cancel") }}
        </button>
        <button
          :disabled="selectedProducts.length === 0"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          @click="confirmOrder"
        >
          {{ $t("confirm") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const { format } = useMoney();

const props = defineProps({
  show: Boolean,
  products: Array,
  productCounts: Object,
  getProductCount: Function,
  incrementProduct: Function,
  decrementProduct: Function,
});

const emit = defineEmits(["close", "confirm"]);

const selectedProducts = computed(() => {
  return props.products.filter(
    (product) => props.productCounts[product.id] > 0
  );
});

const totalAmount = computed(() => {
  return selectedProducts.value.reduce((total, product) => {
    return total + product.price * props.productCounts[product.id];
  }, 0);
});

const confirmOrder = () => {
  emit("confirm");
};
</script>
