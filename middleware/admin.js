export default defineNuxtRouteMiddleware(async () => {
    const { user } = useUserSession();
    return
    if (!user.value) {
        return navigateTo('/login');
    }

    const result = await $fetch('/api/auth/isAdmin', {
        "method": "POST",
        "body": {"id": user.value._id},
    })
    if (result.status !== 200) {
        return navigateTo('/');
    }
})