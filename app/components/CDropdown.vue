<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
    validator: (value) =>
      value.every(
        (item) => typeof item === "object" && "value" in item && "label" in item
      ),
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select an option",
  },
  class: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: () => `dropdown-${Math.random().toString(36).substr(2, 9)}`,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const menuRef = ref(null);
const menuPosition = ref({ top: 0, left: 0, width: 0 });

const selectedItem = computed(() =>
  props.items.find((item) => item.value === props.modelValue)
);

// Calculate absolute position for the dropdown menu
const calculateMenuPosition = async () => {
  if (!dropdownRef.value || !isDropdownOpen.value) return;

  await nextTick();

  const rect = dropdownRef.value.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  menuPosition.value = {
    top: rect.bottom + scrollY,
    left: rect.left + scrollX,
    width: rect.width,
  };

  // Check if menu would overflow and adjust position
  const menuHeight = 240; // max-h-60
  const viewportHeight = window.innerHeight;

  if (rect.bottom + menuHeight > viewportHeight) {
    // Position above if it would overflow
    menuPosition.value.top = rect.top + scrollY - menuHeight;
  }
};

const handleItemSelect = (item) => {
  emit("update:modelValue", item.value);
  isDropdownOpen.value = false;
};

const toggleDropdown = async (event) => {
  event.stopPropagation();
  isDropdownOpen.value = !isDropdownOpen.value;

  if (isDropdownOpen.value) {
    await calculateMenuPosition();
  }
};

const handleClickOutside = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target) &&
    menuRef.value &&
    !menuRef.value.contains(event.target)
  ) {
    isDropdownOpen.value = false;
  }
};

const handleScroll = () => {
  if (isDropdownOpen.value) {
    calculateMenuPosition();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleScroll);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleScroll);
});
</script>

<template>
  <div :id="id" ref="dropdownRef" class="relative inline-block" :class="class">
    <!-- Dropdown Trigger -->
    <button
      type="button"
      class="inline-flex items-center w-full px-2 py-1 text-xs text-gray-900 transition-colors bg-white rounded-md shadow-sm dark:bg-gray-800 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      :aria-expanded="isDropdownOpen"
      :aria-haspopup="true"
      @click="toggleDropdown"
    >
      <span class="truncate">
        {{ selectedItem?.label || placeholder }}
      </span>
      <div class="flex-1" />
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

    <!-- Portal Menu - rendered at body level -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isDropdownOpen"
          ref="menuRef"
          class="fixed z-[9999] overflow-y-auto bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60"
          :style="{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            minWidth: `${menuPosition.width}px`,
          }"
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
      </Transition>
    </Teleport>
  </div>
</template>
