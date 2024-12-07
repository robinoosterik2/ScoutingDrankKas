<script setup>
import { SwitchRoot, SwitchThumb } from 'radix-vue'
import { ref, onMounted, watch } from 'vue'

const switchState = ref(false)

const { $colorMode } = useNuxtApp()

onMounted(() => {
  // Set the initial state based on the current color mode
  switchState.value = $colorMode.preference === 'dark'
})

// Watch for changes in the switch and update color mode
watch(switchState, (newValue) => {
  $colorMode.preference = newValue ? 'dark' : 'light'
})
</script>

<template>
<div class="flex gap-1 items-center ">
  <label
    class="text-black dark:text-white text-[15px] leading-none select-none"
    for="airplane-mode"
  >
    Dark Mode
  </label>
  <SwitchRoot
    id="airplane-mode"
    v-model:checked="switchState"
    class="w-[42px] h-[25px] focus-within:outline focus-within:outline-black flex bg-black/50 shadow-sm rounded-full relative data-[state=checked]:bg-black cursor-default"
  >
    <SwitchThumb
      class="block w-[21px] h-[21px] my-auto bg-white shadow-sm rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]"
    />
  </SwitchRoot>
</div>
</template>