<template>
  <h2
    class="text-4xl font-extrabold text-gray-900 dark:text-white text-start mb-1 mt-6"
  >
    {{ text }}
  </h2>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true,
  },
});
</script>
