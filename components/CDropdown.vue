<script setup>
import { ref, computed } from "vue";

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
});

// Define emits for v-model support
const emit = defineEmits(["update:modelValue"]);

// State for dropdown open/close
const isDropdownOpen = ref(false);

// Find the currently selected item
const selectedItem = computed(() =>
  props.items.find((item) => item.value === props.modelValue)
);

// Handle item selection
const handleItemSelect = (item) => {
  emit("update:modelValue", item.value);
  isDropdownOpen.value = false;
};

// Toggle dropdown visibility
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdownElement = document.getElementById("generic-dropdown");
  if (dropdownElement && !dropdownElement.contains(event.target)) {
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
</script>

<template>
  <div
    id="generic-dropdown"
    class="relative inline-block text-left"
    :class="class"
  >
    <!-- Dropdown Trigger -->
    <div>
      <button
        type="button"
        @click="toggleDropdown"
        class="inline-flex w-full items-center rounded-md bg-white dark:bg-gray-800 px-2 py-1 text-xxs text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 transition-colors"
      >
        <!-- Display selected item label or placeholder -->
        {{ selectedItem?.label || placeholder }}
        <div class="flex-1" />
        <!-- Dropdown arrow icon -->
        <svg
          class="-mr-1 h-3 w-3 text-gray-400"
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
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <button
            v-for="item in items"
            :key="item.value"
            @click="handleItemSelect(item)"
            class="text-gray-700 dark:text-gray-200 block px-1 py-1 text-xxxs w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors data-[active=true]:bg-gray-200 data-[active=true]:dark:bg-gray-600"
            :data-active="item.value === modelValue"
            role="menuitem"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
