<template>
  <div class="relative">
    <!-- Input container with proper attribute order -->
    <div
      class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white cursor-pointer flex justify-between items-center"
      :class="{ 'ring-2 ring-indigo-500': isOpen }"
      @click="handleContainerClick"
    >
      <!-- Hidden input for search -->
      <input
        ref="inputRef"
        v-model="searchTerm"
        type="text"
        class="bg-transparent outline-none w-full cursor-pointer"
        :class="{ 'text-transparent': selectedItem && !isOpen }"
        :placeholder="selectedItem ? '' : placeholder"
        @click.stop
        @input="onSearch"
        @focus="openDropdown"
      >

      <!-- Display selected item when not searching -->
      <div
        v-if="selectedItem && !isOpen"
        class="absolute left-3 right-8 truncate"
      >
        {{ selectedItemDisplay }}
      </div>

      <!-- Dropdown icon -->
      <svg
        class="w-4 h-4 text-gray-400 flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div
        v-if="filteredItems.length === 0"
        class="px-3 py-2 text-gray-500 dark:text-gray-400"
      >
        {{ $t("common.noResults") }}
      </div>
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-700': item.id === modelValue }"
        @click="selectItem(item)"
      >
        {{ formatItem(item) }}
      </div>
    </div>
  </div>

  <!-- Backdrop to close dropdown when clicking outside -->
  <div v-if="isOpen" class="fixed inset-0 z-40" @click="handleBackdropClick" />
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
  itemText: {
    type: String,
    default: 'name',
  },
  placeholder: {
    type: String,
    default: "Select an item",
  },
  searchKeys: {
    type: Array,
    default: () => ['name', 'firstName', 'lastName', 'email'],
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const searchTerm = ref("");
const inputRef = ref(null);

// Format item display text
const formatItem = (item) => {
  if (!item) return "";
  
  // If item has firstName and lastName, format as name
  if (item.firstName || item.lastName) {
    const firstName = item.firstName || '';
    const lastName = item.lastName || '';
    const username = item.username ? `(${item.username})` : '';
    return `${firstName} ${lastName} ${username}`.trim();
  }
  
  // Otherwise try to use the specified text property or default to 'name'
  return item[props.itemText] || item.name || item.id || '';
};

const selectedItem = computed(() => {
  if (!props.modelValue) return null;
  
  // Handle both string IDs and object values
  const id = typeof props.modelValue === 'string' || typeof props.modelValue === 'number'
    ? props.modelValue 
    : props.modelValue?.id;
    
  return props.items.find((item) => item.id === id) || null;
});

const selectedItemDisplay = computed(() => {
  if (!selectedItem.value) return '';
  return formatItem(selectedItem.value);
});

const filteredItems = computed(() => {
  if (!searchTerm.value) return props.items;
  
  const term = searchTerm.value.toLowerCase();
  return props.items.filter(item => {
    // Check each search key for a match
    return props.searchKeys.some(key => {
      const value = item[key];
      return value && typeof value === 'string' && value.toLowerCase().includes(term);
    });
  });
});

// Watch for external modelValue changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === "" && searchTerm.value) {
      searchTerm.value = "";
    }
  },
  { immediate: true }
);

const openDropdown = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    searchTerm.value = "";
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
};

const handleContainerClick = () => {
  if (!isOpen.value) {
    openDropdown();
  } else if (searchTerm.value === "") {
    isOpen.value = false;
  }
};

const selectItem = (item) => {
  if (!item) return;
  
  // Always emit just the ID to keep it simple and consistent
  emit("update:modelValue", item.id);
  searchTerm.value = "";
  isOpen.value = false;
};

const handleBackdropClick = () => {
  isOpen.value = false;
  searchTerm.value = "";
};

const onSearch = (event) => {
  event.stopPropagation();
};
</script>
