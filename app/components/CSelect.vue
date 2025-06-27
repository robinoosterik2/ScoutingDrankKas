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
        :class="{ 'text-transparent': selectedUser && !isOpen }"
        :placeholder="selectedUser ? '' : placeholder"
        @click.stop
        @input="onSearch"
        @focus="openDropdown"
      >
      
      <!-- Display selected user when not searching -->
      <div v-if="selectedUser && !isOpen" class="absolute left-3 right-8 truncate">
        {{ selectedUserDisplay }}
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
        v-if="filteredUsers.length === 0"
        class="px-3 py-2 text-gray-500 dark:text-gray-400"
      >
        {{ $t("common.noResults") }}
      </div>
      <div
        v-for="user in filteredUsers"
        :key="user._id"
        class="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        :class="{ 'bg-gray-100 dark:bg-gray-700': user._id === modelValue }"
        @click="selectUser(user)"
      >
        {{ formatName(user) }}
      </div>
    </div>
  </div>

  <!-- Backdrop to close dropdown when clicking outside -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40"
    @click="handleBackdropClick"
  />
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  users: {
    type: Array,
    default: () => []
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
  if (!user) return '';
  const firstName = user.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : '';
  const lastName = user.lastName ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1) : '';
  return `${firstName} ${lastName} ${user.username ? `- ${user.username}` : ''}`.trim();
};

const selectedUser = computed(() => {
  return props.users.find(user => user._id === props.modelValue);
});

const selectedUserDisplay = computed(() => {
  if (!selectedUser.value) return '';
  return formatName(selectedUser.value);
});

// Filter users based on search term
const filteredUsers = computed(() => {
  if (!searchTerm.value) return props.users;
  
  const search = searchTerm.value.toLowerCase();
  return props.users.filter(user => {
    if (!user) return false;
    const fullName = formatName(user).toLowerCase();
    return fullName.includes(search) ||
           (user.username && user.username.toLowerCase().includes(search)) ||
           (user.firstName && user.firstName.toLowerCase().includes(search)) ||
           (user.lastName && user.lastName.toLowerCase().includes(search));
  });
});

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
  if (newVal === '' && searchTerm.value) {
    searchTerm.value = '';
  }
}, { immediate: true });

const openDropdown = () => {
  if (!isOpen.value) {
    isOpen.value = true;
    searchTerm.value = '';
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
};

const handleContainerClick = () => {
  if (!isOpen.value) {
    openDropdown();
  } else if (searchTerm.value === '') {
    isOpen.value = false;
  }
};

const selectUser = (user) => {
  if (!user) return;
  emit('update:modelValue', user._id);
  isOpen.value = false;
  searchTerm.value = '';
};

const handleBackdropClick = () => {
  isOpen.value = false;
  searchTerm.value = '';
};

const onSearch = (event) => {
  event.stopPropagation();
};
</script>