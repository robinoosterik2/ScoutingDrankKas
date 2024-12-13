<script setup>
import { SwitchRoot, SwitchThumb } from "radix-vue";
import { ref, onMounted, watch } from "vue";

const switchState = ref(false);
const { $colorMode } = useNuxtApp();

onMounted(() => {
  switchState.value = $colorMode.preference === "dark";
  // Set the initial state based on the current color mode
});

// Watch for changes in the switch and update color mode
watch(switchState, (newValue) => {
  $colorMode.preference = newValue ? "dark" : "light";
});
</script>

<template>
  <div class="flex items-center space-x-3 group">
    <label
      for="dark-mode-toggle"
      class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black group-hover:dark:text-white cursor-pointer select-none"
    >
      Dark Mode
    </label>

    <SwitchRoot
      id="dark-mode-toggle"
      v-model:checked="switchState"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 hover:dark:bg-gray-600"
    >
      <SwitchThumb
        class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-300 shadow-lg ring-0 transition duration-200 ease-in-out translate-x-0 data-[state=checked]:translate-x-5 group-hover:scale-105"
      />
    </SwitchRoot>
  </div>
</template>

<style scoped>
/* Add a subtle glow effect on hover */
.group:hover .SwitchRoot {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
