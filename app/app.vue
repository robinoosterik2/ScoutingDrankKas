<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { setLocale } = useI18n();

useHead({
  title: "Drankkas",
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/logo.svg",
    },
  ],
});

onBeforeMount(() => {
  const savedLanguage = localStorage.getItem("selectedLanguage");
  if (savedLanguage) {
    setLocale(savedLanguage);
  }
});
</script>
