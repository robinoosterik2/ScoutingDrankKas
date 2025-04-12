<template></template>

<script setup>
import { useRouter } from "vue-router";
import { useUserSession } from "../composables/useUserSession";

const router = useRouter();
// Get the user session clear function to reset client-side auth state
const { clear } = useUserSession();

try {
  // First call the API to clear the server-side session
  await $fetch("/api/auth/logout", { method: "POST" });
  // Then clear the client-side session state
  await clear();
  // Finally, redirect to login page
  router.push("/login");
} catch (error) {
  console.error("Failed to logout:", error);
  alert("Failed to logout. Please try again.");
}
</script>
