<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white"
  >
    <div class="flex p-2 gap-2">
      <ColorModeToggle />
      <ToggleLang />
    </div>
    <div class="container mx-auto">
      <slot />
    </div>
  </div>
</template>
