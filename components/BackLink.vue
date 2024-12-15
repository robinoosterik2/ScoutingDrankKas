<template>
  <div class="w-fit py-1">
    <NuxtLink
      :to="to"
      class="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <slot>{{ $t('backTo') }} {{ backPage }}</slot>
    </NuxtLink>
  </div>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    default: "/",
  },
  backPage: {
    type: String,
    default: "Back to Previous Page",
  },
});
</script>
