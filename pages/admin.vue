<template>
    <div>
        <h1>Welcome {{ user.username }}!</h1>
        <p>Logged in since {{ session.loggedInAt }}</p>
        <button @click="logout">Logout</button>
    </div>
</template>

<script setup>
    const { loggedIn, user, session, clear, fetch } = useUserSession()
    if (!loggedIn.value) {
        navigateTo('/login')
    }
</script>