<script setup>
    const { loggedIn, user, session, clear } = useUserSession()
    const logout = () => {
        clear()
        navigateTo('/login')
    }

    onMounted(() => {
        if (!loggedIn.value) {
            navigateTo('/login')
        }
    })
</script>

<template>
  <div v-if="loggedIn">
    <h1>Welcome {{ user.username }}!</h1>
    <p>Logged in since {{ session.loggedInAt }}</p>
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <h1>Not logged in</h1>
  </div>
</template>