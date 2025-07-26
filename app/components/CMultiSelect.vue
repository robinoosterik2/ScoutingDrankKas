<template>
  <div class="relative">
    <!-- Input container -->
    <div
      class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white cursor-pointer flex flex-wrap gap-1"
      :class="{ 'ring-2 ring-indigo-500': isOpen }"
      @click="handleContainerClick"
    >
      <!-- Selected items as chips -->
      <div v-if="selectedItems.length > 0" class="flex flex-wrap gap-1">
        <span
          v-for="item in selectedItems"
          :key="item._id"
          class="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-100"
        >
          {{ item.name }}
          <button
            type="button"
            class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 dark:hover:bg-indigo-800 dark:hover:text-indigo-300"
            @click.stop="toggleItem(item)"
          >
            <span class="sr-only">Remove</span>
            <svg class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
              <path
                fill-rule="evenodd"
                d="M4 3.293L6.146 1.146a.5.5 0 0 1 .708.708L4.707 4l2.147 2.146a.5.5 0 0 1-.708.708L4 4.707l-2.146 2.147a.5.5 0 0 1-.708-.708L3.293 4 1.146 1.854a.5.5 0 1 1 .708-.708L4 3.293z"
              />
            </svg>
          </button>
        </span>
      </div>

      <!-- Search input -->
      <input
        ref="inputRef"
        v-model="searchTerm"
        type="text"
        class="flex-1 bg-transparent outline-none min-w-[100px]"
        :placeholder="selectedItems.length === 0 ? placeholder : ''"
        @click.stop
        @input="onSearch"
        @focus="openDropdown"
      />

      <!-- Dropdown icon -->
      <svg
        class="w-4 h-4 text-gray-400 flex-shrink-0 self-center"
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
        :key="item._id"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        :class="{ 'bg-gray-100 dark:bg-gray-700': isSelected(item) }"
        @click="toggleItem(item)"
      >
        <input
          type="checkbox"
          :checked="isSelected(item)"
          class="h-4 w-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500"
          @click.stop
        />
        <span class="ml-2">{{ item.name }}</span>
      </div>
    </div>
  </div>

  <!-- Backdrop to close dropdown when clicking outside -->
  <div v-if="isOpen" class="fixed inset-0 z-40" @click="handleBackdropClick" />
</template>

<script setup>
import { ref, computed, nextTick } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  items: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select items",
  },
  itemText: {
    type: String,
    default: "name",
  },
  itemValue: {
    type: String,
    default: "_id",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const searchTerm = ref("");
const inputRef = ref(null);

// Computed properties
const selectedItems = computed(() => {
  if (!props.modelValue || props.modelValue.length === 0) return [];
  return props.items.filter((item) =>
    props.modelValue.includes(item[props.itemValue])
  );
});

const filteredItems = computed(() => {
  if (!searchTerm.value) return props.items;
  const search = searchTerm.value.toLowerCase();
  return props.items.filter(
    (item) =>
      item[props.itemText].toLowerCase().includes(search) ||
      item[props.itemValue].toLowerCase().includes(search)
  );
});

// Methods
const isSelected = (item) => {
  return props.modelValue.includes(item[props.itemValue]);
};

const toggleItem = (item) => {
  const itemValue = item[props.itemValue];
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(itemValue);

  if (index > -1) {
    newValue.splice(index, 1);
  } else {
    newValue.push(itemValue);
  }

  emit("update:modelValue", newValue);
};

const openDropdown = () => {
  isOpen.value = true;
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

const handleContainerClick = () => {
  if (!isOpen.value) {
    openDropdown();
  }
};

const handleBackdropClick = () => {
  isOpen.value = false;
  searchTerm.value = "";
};

const onSearch = (event) => {
  searchTerm.value = event.target.value;
};
</script>
