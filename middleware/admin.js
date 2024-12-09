export default defineNuxtRouteMiddleware(async () => {
    const { user } = useUserSession();
    if (!user.value) {
        return navigateTo('/login');
    }

    const result = await $fetch('/api/auth/isAdmin', {
        "method": "POST",
        "body": {"id": user.value._id},
    })
    console.log("result: ", result);
    if (result.status !== 200) {
        return navigateTo('/');
    }
})