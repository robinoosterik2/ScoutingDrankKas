<template>
  <div class="flex">
    <CButton class="w-fit p-2 m-2" @click="setLocale('en')">English</CButton>
    <CButton class="w-fit p-2 m-2" @click="setLocale('nl')">Nederlands</CButton>
  </div>
</template>
<script setup>
const { setLocale } = useI18n();
</script>
