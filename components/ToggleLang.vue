<script setup>
import { ref } from 'vue'

const { setLocale, locale } = useI18n()

const languages = [
  { code: 'en', name: 'English' },
  { code: 'nl', name: 'Nederlands' }
]

const isDropdownOpen = ref(false)

const handleLanguageChange = (langCode) => {
  setLocale(langCode)
  isDropdownOpen.value = false
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const dropdownElement = document.getElementById('language-dropdown')
  if (dropdownElement && !dropdownElement.contains(event.target)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div 
    id="language-dropdown" 
    class="relative inline-block text-left w-22"
  >
    <div>
      <button 
        type="button"
        @click="toggleDropdown"
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md 
               bg-white dark:bg-gray-800 px-3 py-2 text-xs 
               text-gray-900 dark:text-white shadow-sm ring-1 ring-inset 
               ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 
               dark:hover:bg-gray-700 transition-colors"
      >
        {{ 
          languages.find(lang => lang.code === locale)?.name 
          || 'Select Language' 
        }}
        <svg 
          class="-mr-1 h-4 w-4 text-gray-400" 
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
        class="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md 
               bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black 
               ring-opacity-5 focus:outline-none"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <button
            v-for="lang in languages"
            :key="lang.code"
            @click="handleLanguageChange(lang.code)"
            class="text-gray-700 dark:text-gray-200 block px-2 py-2 text-xs w-full text-left 
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            role="menuitem"
          >
            {{ lang.name }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>