<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
  >
    <div class="flex p-2 gap-2">
      <ToggleColorMode />
      <ToggleLang />
    </div>
    <div class="container mx-auto">
      <slot />
    </div>
  </div>
</template>
