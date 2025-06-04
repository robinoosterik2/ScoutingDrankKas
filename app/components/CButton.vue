<template>
    <button
      :class="[
        'inline-flex items-center justify-center rounded transition-colors',
        typeClasses,
      ]"
      @click="handleClick"
    >
      <slot>{{ label }}</slot>
    </button>
  </template>
  
  <script setup>
  import { computed } from 'vue'; // Ensure computed is imported

  type ButtonType = "primary" | "secondary" | "system" | "roles" | "users" | "products" | "logs";

  interface CButtonProps {
    label?: string;
    type?: ButtonType;
  }

  const props = withDefaults(defineProps<CButtonProps>(), {
    label: "",
    type: "primary",
  });

  const typeClassMapping: Record<ButtonType, string> = {
    primary: "text-xs bg-blue-600 text-white hover:bg-blue-700",
    secondary: "text-xs border border-current text-current hover:bg-gray-600",
    system: "text-xs bg-red-600 text-white hover:bg-red-700",
    roles: "text-xs bg-indigo-600 text-white hover:bg-indigo-700",
    users: "text-xs bg-green-600 text-white hover:bg-green-700",
    products: "text-xs bg-purple-600 text-white hover:bg-purple-700",
    logs: "text-xs bg-yellow-600 text-white hover:bg-yellow-700",
  };
  
  const typeClasses = computed(() => {
    return typeClassMapping[props.type as ButtonType] || typeClassMapping.primary;
  });

  // Define handleClick if it's intended to do more than just emit a click event
  // For now, assuming it's a native click event or handled by a parent listener.
  // const emit = defineEmits(['click']);
  // const handleClick = (event: MouseEvent) => {
  //   emit('click', event);
  // };
  </script>
  