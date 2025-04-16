<template>
  <NuxtLink
    :to=$localePath(to)
    :class="[
      'w-full block text-center p-2 rounded-md transition-colors',
      typeClasses,
      hoverClasses,
    ]"
  >
    <slot>{{ label }}</slot>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "system", "roles", "users", "products", "logs"].includes(
        value
      ),
  },
});

const typeClasses = computed(() => {
  switch (props.type) {
    case "roles":
      return "text-xl bg-indigo-600 text-white hover:bg-indigo-700";
    case "users":
      return "text-xl bg-green-600 text-white hover:bg-green-700";
    case "products":
      return "text-xl bg-purple-600 text-white hover:bg-purple-700";
    case "categories":
      return "text-xl bg-pink-600 text-white hover:bg-pink-700";
    case "logs":
      return "text-xl bg-yellow-600 text-white hover:bg-yellow-700";
    case "system":
      return "text-xl bg-red-600 text-white hover:bg-red-700";
    case "primary":
      return "text-xl bg-blue-600 text-white hover:bg-blue-700";
    case "secondary":
      return "text-xl border border-current text-current hover:bg-gray-600";
    default:
      return "text-xl bg-blue-600 text-white hover:bg-blue-700";
  }
});

const hoverClasses = computed(() => {});
</script>
