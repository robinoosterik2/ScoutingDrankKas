export default defineNuxtRouteMiddleware((to, from) => {
    // Do not run this middleware on /login or /register pages
    if (to.path === '/login' || to.path === '/register') {
        return;
    } 
    // Check if the user is logged in
    const { loggedIn } = useUserSession()
    if (!loggedIn.value) {
        return navigateTo('/login')
    }
})