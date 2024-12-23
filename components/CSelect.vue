<!-- SearchableSelect.vue -->
<template>
  <div class="relative">
    <div
      @click="toggleDropdown"
      class="w-full px-3 py-2 border dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white cursor-pointer flex justify-between items-center"
    >
      <input
        type="text"
        v-model="searchTerm"
        @input="onSearch"
        @focus="isOpen = true"
        @click="handleInputClick"
        ref="inputRef"
        :placeholder="placeholder"
        class="bg-transparent outline-none w-full"
      />
      <svg
        class="w-4 h-4 text-gray-400"
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

    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div
        v-if="filteredUsers.length === 0"
        class="px-3 py-2 text-gray-500 dark:text-gray-400"
      >
        {{ $t("common.noResults") }}
      </div>
      <div
        v-for="user in filteredUsers"
        :key="user._id"
        @click="selectUser(user)"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-700': user._id === modelValue }"
      >
        {{ formatName(user) }}
      </div>
    </div>
  </div>

  <!-- Backdrop to close dropdown when clicking outside -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40"
    @click="isOpen = false"
  ></div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: String,
  users: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select a user'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchTerm = ref('');
const inputRef = ref(null);

// Format user name and username
const formatName = (user) => {
  const firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
  const lastName = user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1);
  return `${firstName} ${lastName} - ${user.username}`;
};

// Filter users based on search term
const filteredUsers = computed(() => {
  if (!searchTerm.value) return props.users;
  
  const search = searchTerm.value.toLowerCase();
  return props.users.filter(user => {
    const fullName = formatName(user).toLowerCase();
    return fullName.includes(search) ||
           user.username.toLowerCase().includes(search) ||
           user.firstName.toLowerCase().includes(search) ||
           user.lastName.toLowerCase().includes(search);
  });
});

// Update search term when modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    searchTerm.value = '';
    return;
  }
  
  const selectedUser = props.users.find(user => user._id === newValue);
  if (selectedUser) {
    searchTerm.value = formatName(selectedUser);
  }
}, { immediate: true });

const handleInputClick = (event) => {
  event.stopPropagation();
  if (props.modelValue && searchTerm.value) {
    // Select all text in the input
    event.target.select();
  }
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.modelValue && inputRef.value) {
    // Ensure input is focused and text is selected when opening dropdown
    inputRef.value.focus();
    inputRef.value.select();
  }
};

const selectUser = (user) => {
  emit('update:modelValue', user._id);
  searchTerm.value = formatName(user);
  isOpen.value = false;
};

const onSearch = () => {
  emit('update:modelValue', null);
  isOpen.value = true;
};
</script>