<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Select date",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  min: {
    type: String,
    default: "",
  },
  max: {
    type: String,
    default: "",
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const dateInput = ref(null);
const showDateInput = ref(false);
const formattedDate = ref('');

// Format date for display (e.g., "2023-07-24" -> "24-07-2023")
const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

// Toggle between text and date input
const toggleInputType = () => {
  if (props.disabled) return;
  showDateInput.value = true;
  nextTick(() => {
    if (dateInput.value) {
      dateInput.value.showPicker();
      dateInput.value.focus();
    }
  });
};

// Handle date selection
const handleDateChange = (event) => {
  emit('update:modelValue', event.target.value);
  showDateInput.value = false;
};

// Close date picker when clicking outside
onClickOutside(dateInput, () => {
  if (showDateInput.value) {
    showDateInput.value = false;
  }
});

// Close date picker on Escape key
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showDateInput.value) {
    showDateInput.value = false;
  }
};

// Set up event listeners
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  formattedDate.value = formatDisplayDate(props.modelValue);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    formattedDate.value = formatDisplayDate(newVal);
  }
);
</script>

<template>
  <div class="relative w-full" ref="containerRef">
    <div class="relative">
      <!-- Visible text input -->
      <input
        v-if="!showDateInput"
        :value="formattedDate"
        :placeholder="placeholder"
        :disabled="disabled"
        readonly
        class="block w-full px-3 py-2 border rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{
          'border-red-300 dark:border-red-600': error,
          'border-gray-300 dark:border-gray-600': !error
        }"
        @click="toggleInputType"
      />
      <!-- Native date input (hidden until clicked) -->
      <input
        v-else
        ref="dateInput"
        type="date"
        :value="modelValue"
        :min="min"
        :max="max"
        @change="handleDateChange"
        @blur="showDateInput = false"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>

    <!-- Calendar Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="absolute z-[9999] mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600"
        style="z-index: 9999"
      >
        <input
          ref="dateInput"
          type="date"
          :value="modelValue"
          :min="min"
          :max="max"
          :class="{
            'border-red-300 dark:border-red-600': error,
            'border-gray-300 dark:border-gray-600': !error,
          }"
          class="w-full px-3 py-2 border-0 focus:ring-2 focus:ring-indigo-500 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          @change="selectDate"
        />
      </div>
    </transition>

    <!-- Error Message -->
    <p
      v-if="error && errorMessage"
      class="mt-1 text-sm text-red-600 dark:text-red-400"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
