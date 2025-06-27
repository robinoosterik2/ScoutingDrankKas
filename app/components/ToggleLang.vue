<script setup>
import { ref, onBeforeMount } from 'vue';
const { setLocale, locale } = useI18n()

// Define language items in the required format for the generic dropdown
const languageItems = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Nederlands' },
]

// Handle language change
const handleLanguageChange = (selectedLang) => {
  setLocale(selectedLang)
  localStorage.setItem('selectedLanguage', selectedLang)
}

// Retrieve the saved language from localStorage before component mount

</script>

<template>
  <div class="flex items-center">
    <CDropdown 
      :items="languageItems"
      :model-value="locale"
      placeholder="Select Language"
      class="w-20"
      @update:model-value="handleLanguageChange"
    />
  </div>
</template>