<template></template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
try {
  await $fetch("/api/auth/logout", { method: "POST" });
  router.push("/login");
} catch (error) {
  console.error("Failed to logout:", error);
  alert("Failed to logout. Please try again.");
}
</script>
