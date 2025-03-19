export default defineNuxtRouteMiddleware(async (event) => { 
    if (event.fullPath.startsWith('/admin') || event.fullPath.startsWith('/api/admin')) {
        try {
            const { loggedIn, user, session, fetch, clear } = useUserSession()
            if (!user.value) {
                console.error("User is undefined");
                return navigateTo('/login');
            }
            if (!session.value.isAdmin) {
                console.error("User is not an admin");
                return navigateTo('/');
            }
        } catch (error) {
            console.error("Authentication error", error);
            if (event.fullPath.startsWith('/api/')) {
                throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required" });
            } else {
                return navigateTo('/login');
            }
        }
    }
});