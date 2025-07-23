<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative mx-4"
      >
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Content -->
        <div class="space-y-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t("orderDetails") }}
          </h3>

          <!-- Loading State -->
          <div v-if="!order" class="text-center py-8">
            <p class="text-gray-500 dark:text-gray-400 animate-pulse">
              {{ $t("loadingOrderDetails") }}
            </p>
          </div>

          <!-- Order Details -->
          <div v-else class="space-y-6">
            <!-- Order Metadata -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t("common.orderId") }}
                </p>
                <p class="text-gray-900 dark:text-white font-mono">
                  {{ order._id }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t("common.orderDate") }}
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{
                    new Date(order.createdAt).toLocaleString("nl-nl", {
                      hour12: false,
                    })
                  }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t("common.orderedBy") }}
                </p>
                <p class="text-gray-900 dark:text-white">
                  {{ order.user.firstName }} {{ order.user.lastName }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {{ $t("Total") }}
                </p>
                <p class="text-gray-900 dark:text-white font-semibold">
                  {{ format(order.total) }}
                </p>
              </div>
            </div>

            <!-- Divider -->
            <hr class="border-gray-200 dark:border-gray-700" />

            <!-- Products List -->
            <div>
              <h4
                class="text-lg font-semibold text-gray-900 dark:text-white mb-3"
              >
                {{ $t("Products") }}
              </h4>
              <ul class="space-y-3">
                <li
                  v-for="(item, index) in order.products"
                  :key="index"
                  class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">
                        {{ item.product?.name || item.product }}
                      </p>
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {{ $t("Quantity") }}: {{ item.count }}
                      </p>
                    </div>
                    <p class="text-gray-900 dark:text-white">
                      {{ format(item.product?.price * item.count) }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Bartender Info -->
            <div v-if="order.bartender" class="mt-4">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ $t("Bartender") }}
              </p>
              <p class="text-gray-900 dark:text-white">
                {{ order.bartender.firstName }} {{ order.bartender.lastName }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from "vue";
const { format } = useMoney();

const props = defineProps({
  isOpen: Boolean,
  orderId: [String, Number],
});
const order = ref(null);

const fetchOrderDetails = async () => {
  try {
    order.value = await $fetch(`/api/orders/${props.orderId}`);
  } catch (error) {
    console.error("Failed to fetch order details", error);
  }
};

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.orderId) {
      fetchOrderDetails();
    }
  }
);
</script>
