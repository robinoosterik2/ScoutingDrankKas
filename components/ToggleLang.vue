<script setup>
const { setLocale, locale } = useI18n()

// Define language items in the required format for the generic dropdown
const languageItems = [
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Nederlands' },
]

// Handle language change
const handleLanguageChange = (selectedLang) => {
  setLocale(selectedLang)
}
</script>

<template>
  <div class="flex items-center">
    <CDropdown 
      :items="languageItems"
      :model-value="locale"
      @update:model-value="handleLanguageChange"
      placeholder="Select Language"
      class="w-20"
    />
  </div>
</template>