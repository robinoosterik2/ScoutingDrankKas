<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        @click="handleOverlayClick"
      >
        <!-- Background overlay -->
        <div
          class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
        >
          <div
            class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            aria-hidden="true"
          ></div>

          <!-- Modal panel -->
          <div
            ref="modalPanel"
            class="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-2xl rounded-2xl"
          >
            <!-- Modal Header -->
            <div
              class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-white flex items-center">
                  <svg
                    class="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {{ $t("purchases.newStockPurchase") }}
                </h3>
                <button
                  @click="closeModal"
                  class="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="max-h-[70vh] overflow-y-auto">
              <form class="p-8 space-y-8" @submit.prevent="submitStockPurchase">
                <!-- Product Selection -->
                <div class="space-y-3">
                  <label
                    class="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2"
                  >
                    {{ $t("Product") }}
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="relative group">
                    <select
                      v-model="selectedProduct"
                      class="w-full px-5 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 appearance-none bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md"
                      required
                    >
                      <option :value="null" disabled class="text-gray-500">
                        {{ $t("purchases.selectProduct") }}
                      </option>
                      <option
                        v-for="product in products"
                        :key="product.id"
                        :value="product"
                        class="py-2"
                      >
                        {{ product.name }}
                        <template
                          v-if="product.packSize && product.packSize > 1"
                        >
                          ({{
                            $t("purchases.packOf", { count: product.packSize })
                          }})
                        </template>
                      </option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
                    >
                      <svg
                        class="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Quantity Section -->
                <div class="space-y-4">
                  <div
                    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <label
                      class="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                    >
                      {{ $t("purchases.quantity") }}
                      <span class="text-red-500">*</span>
                    </label>
                    <div
                      v-if="selectedProductPackSize > 1"
                      class="flex items-center"
                    >
                      <label
                        class="inline-flex items-center cursor-pointer group"
                      >
                        <input
                          v-model="usePackSize"
                          type="checkbox"
                          class="w-5 h-5 rounded-md border-2 border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200"
                        />
                        <span
                          class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        >
                          {{ $t("purchases.buyInPacks") }} ({{
                            selectedProductPackSize
                          }}/{{ $t("purchases.pack") }})
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Pack Quantity Controls -->
                  <div
                    v-if="usePackSize && selectedProductPackSize > 1"
                    class="space-y-5"
                  >
                    <div
                      class="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800"
                    >
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                          <div
                            class="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center"
                          >
                            <svg
                              class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                          <div>
                            <p
                              class="text-lg font-semibold text-indigo-800 dark:text-indigo-200"
                            >
                              {{ $t("purchases.packs") }}
                            </p>
                            <p
                              class="text-lg text-indigo-600 dark:text-indigo-400"
                            >
                              {{
                                $t("purchases.totalItems", {
                                  count: packQuantity * selectedProductPackSize,
                                })
                              }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center space-x-3">
                          <button
                            type="button"
                            class="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 flex items-center justify-center group"
                            @click="
                              packQuantity = Math.max(1, packQuantity - 1)
                            "
                          >
                            <svg
                              class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <input
                            v-model.number="packQuantity"
                            type="number"
                            min="1"
                            class="w-20 px-3 py-2 text-center text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <button
                            type="button"
                            class="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 flex items-center justify-center group"
                            @click="packQuantity += 1"
                          >
                            <svg
                              class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Individual Quantity Controls -->
                  <div v-else class="space-y-4">
                    <div
                      class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <div
                            class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
                          >
                            <svg
                              class="w-5 h-5 text-gray-600 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p
                              class="text-sm font-semibold text-gray-800 dark:text-gray-200"
                            >
                              {{ $t("purchases.items") }}
                            </p>
                            <p class="text-lg text-gray-600 dark:text-gray-400">
                              {{ $t("purchases.amount", { count: quantity }) }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center space-x-3">
                          <button
                            type="button"
                            @click="quantity = Math.max(1, quantity - 1)"
                            class="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center group"
                          >
                            <svg
                              class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <input
                            v-model.number="quantity"
                            type="number"
                            min="1"
                            class="w-20 px-3 py-2 text-center text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                          />
                          <button
                            type="button"
                            @click="quantity += 1"
                            class="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center group"
                          >
                            <svg
                              class="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Price Input -->
                <div class="space-y-3">
                  <label
                    class="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    {{ $t("purchases.totalPrice") }}
                    <span class="text-red-500">*</span>
                  </label>
                  <div class="relative group">
                    <div
                      class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"
                    >
                      <span
                        class="text-xl font-semibold text-gray-500 dark:text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors"
                        >€</span
                      >
                    </div>
                    <input
                      v-model.number="formData.price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full pl-12 pr-5 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md [appearance:textfield]"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <!-- Notes -->
                <div class="space-y-3">
                  <label
                    class="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                  >
                    {{ $t("purchases.notes") }}
                  </label>
                  <textarea
                    v-model="formData.notes"
                    rows="4"
                    class="w-full px-5 py-4 text-base border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-3 focus:ring-indigo-200 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md"
                    :placeholder="$t('purchases.notesPlaceholder')"
                  />
                </div>

                <!-- Modal Footer -->
                <div
                  class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    {{ $t("common.cancel") }}
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmitting || !selectedProduct"
                    class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span v-if="isSubmitting" class="flex items-center">
                      <svg
                        class="animate-spin -ml-1 mr-3 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        />
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {{ $t("purchases.submitting") }}
                    </span>
                    <span v-else class="flex items-center">
                      <svg
                        class="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      {{
                        $t("purchases.buyButton", {
                          product: selectedProduct?.name || "",
                          amount: usePackSize
                            ? packQuantity * selectedProductPackSize
                            : quantity,
                        })
                      }}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "submit"]);

// Form state
const selectedProduct = ref(null);
const packQuantity = ref(1);
const quantity = ref(1);
const usePackSize = ref(false);
const isSubmitting = ref(false);
const modalPanel = ref(null);

const formData = ref({
  productId: "",
  quantity: 1,
  price: 0,
  notes: "",
});

// Computed properties
const selectedProductPackSize = computed(() => {
  return selectedProduct.value?.packSize || 1;
});

// Watchers
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Reset form when modal opens
      resetForm();
      // Focus management
      nextTick(() => {
        const firstInput = modalPanel.value?.querySelector(
          "select, input, textarea"
        );
        firstInput?.focus();
      });
    }
  }
);

watch(usePackSize, (newVal) => {
  if (newVal) {
    packQuantity.value = 1;
  } else {
    quantity.value = 1;
  }
});

watch(selectedProduct, (newProduct) => {
  if (newProduct) {
    formData.value.productId = newProduct.id;
    packQuantity.value = 1;
    quantity.value = 1;
    usePackSize.value = false;
  }
});

// Methods
const closeModal = () => {
  if (!isSubmitting.value) {
    emit("close");
  }
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

const resetForm = () => {
  selectedProduct.value = null;
  packQuantity.value = 1;
  quantity.value = 1;
  usePackSize.value = false;
  formData.value = {
    productId: "",
    quantity: 1,
    price: 0,
    notes: "",
  };
};

const submitStockPurchase = async () => {
  isSubmitting.value = true;

  try {
    const totalQuantity = usePackSize.value
      ? packQuantity.value * selectedProductPackSize.value
      : quantity.value;

    const purchaseData = {
      productId: selectedProduct.value.id,
      quantity: totalQuantity,
      price: formData.value.price,
      notes: formData.value.notes,
      packSize: usePackSize.value ? selectedProductPackSize.value : null,
      packQuantity: usePackSize.value ? packQuantity.value : null,
    };

    emit("submit", purchaseData);
  } catch (error) {
    console.error("Error submitting purchase:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Keyboard event handling
const handleKeydown = (event) => {
  if (event.key === "Escape" && !isSubmitting.value) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-enter-active .fixed {
  transition: opacity 0.3s ease;
}

.modal-enter-from .fixed,
.modal-leave-to .fixed {
  opacity: 0;
}
</style>
