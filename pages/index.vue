<script setup>
const { loggedIn, user, session, clear, fetch } = useUserSession();
const { t } = useI18n();

const logout = () => {
  $fetch("/api/auth/logout", { method: "POST" });
  navigateTo("/login");
};

</script>

<template>
  <div v-if="loggedIn">
    <h1>{{ t("welcome", { username: user.username }) }}</h1>
    <p>{{ t("loggedInSince", { time: session.loggedInAt }) }}</p>
    <button @click="logout">{{ t("logout") }}</button>
  </div>
  <div v-else>
    <h1>{{ t("notLoggedIn") }}</h1>
  </div>

</template>
