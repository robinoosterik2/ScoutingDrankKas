<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

// Define props with default values and type validation
const props = defineProps({
  // The list of items to display in the dropdown
  items: {
    type: Array,
    required: true,
    validator: (value) =>
      value.every(
        (item) => typeof item === "object" && "value" in item && "label" in item
      ),
  },
  // Currently selected value
  modelValue: {
    type: [String, Number],
    default: null,
  },
  // Placeholder text when no item is selected
  placeholder: {
    type: String,
    default: "Select an option",
  },
  // Optional class for additional styling
  class: {
    type: String,
    default: "",
  },
  // Custom ID for the dropdown
  id: {
    type: String,
    default: () => `dropdown-${Math.random().toString(36).substr(2, 9)}`,
  },
});

// Define emits for v-model support
const emit = defineEmits(["update:modelValue"]);

// State for dropdown open/close - each instance gets its own state
const isDropdownOpen = ref(false);

// Reference to the dropdown element
const dropdownRef = ref(null);

// Find the currently selected item
const selectedItem = computed(() =>
  props.items.find((item) => item.value === props.modelValue)
);

// Handle item selection
const handleItemSelect = (item) => {
  emit("update:modelValue", item.value);
  // Close the dropdown after selection
  isDropdownOpen.value = false;
};

// Toggle dropdown visibility
const toggleDropdown = (event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

// Add and remove event listener
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// Watch for external changes to close dropdown
watch(
  () => props.modelValue,
  () => {
    // Don't auto-close here, let the selection handler do it
  }
);
</script>

<template>
  <div ref="dropdownRef" :id="id" class="relative inline-block" :class="class">
    <!-- Dropdown Trigger -->
    <div>
      <button
        type="button"
        class="inline-flex items-center w-full px-2 py-1 text-xs text-gray-900 transition-colors bg-white rounded-md shadow-sm dark:bg-gray-800 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        @click="toggleDropdown"
        :aria-expanded="isDropdownOpen"
        :aria-haspopup="true"
      >
        <!-- Display selected item label or placeholder -->
        <span class="truncate">
          {{ selectedItem?.label || placeholder }}
        </span>
        <div class="flex-1" />
        <!-- Dropdown arrow icon -->
        <svg
          class="w-3 h-3 -mr-1 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu with Transition -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 z-50 w-full min-w-max overflow-y-auto origin-top-right bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60"
        role="menu"
        aria-orientation="vertical"
        :aria-labelledby="id"
      >
        <div class="py-1">
          <button
            v-for="item in items"
            :key="`${id}-${item.value}`"
            type="button"
            class="text-gray-700 dark:text-gray-200 block px-3 py-2 text-xs w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none"
            :class="{
              'bg-gray-100 dark:bg-gray-700': item.value === modelValue,
            }"
            role="menuitem"
            @click.stop="handleItemSelect(item)"
            @keydown.enter="handleItemSelect(item)"
            @keydown.space.prevent="handleItemSelect(item)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
