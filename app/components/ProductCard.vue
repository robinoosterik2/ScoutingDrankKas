<template>
  <div
    class="relative flex flex-col justify-between p-4 transition-shadow bg-white border rounded-lg cursor-pointer dark:bg-gray-800 hover:shadow-md"
  >
    <img
      :src="getDisplayableProductImageUrl(product.imageUrl)"
      :alt="product.name"
      class="object-cover w-full rounded aspect-video"
    />
    <div class="flex items-center justify-between mt-4 align-middle">
      <h3 class="text-2xl text-gray-700 dark:text-gray-300">
        {{ product.name }}
      </h3>
      <p class="text-xl text-gray-500 dark:text-gray-400">
        {{ format(product.price) }}
      </p>
    </div>
    <div class="flex items-center justify-between mt-2">
      <button
        class="flex items-center justify-center w-24 h-10 text-white bg-red-500 rounded-full"
        :disabled="count === 0"
        @click="handleDecrement"
      >
        <div class="text-2xl">-</div>
      </button>
      <span class="text-2xl text-gray-700 dark:text-gray-300">
        {{ count }}
      </span>
      <button
        class="flex items-center justify-center w-24 h-10 text-white bg-green-500 rounded-full"
        @click="handleIncrement"
      >
        <div class="text-2xl">+</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { getDisplayableProductImageUrl } from "@/utils/imageUtils";
const { format } = useMoney();
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["increment", "decrement"]);

const handleIncrement = () => {
  emit("increment", props.product);
};

const handleDecrement = () => {
  emit("decrement", props.product);
};
</script>
