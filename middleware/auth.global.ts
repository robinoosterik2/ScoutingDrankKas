export default defineNuxtRouteMiddleware(async (event) => {
    const nonAuthRequiredPaths = ['/login', '/register', '/logout', '/reset-password', '/user/forgot-password'];
    
    // Skip auth check for non-auth required paths
    if (nonAuthRequiredPaths.some(path => event.fullPath.startsWith(path))) {
        return;
    }
    
    // Handle admin routes
    if (event.fullPath.startsWith('/admin') || event.fullPath.startsWith('/api/admin')) {
        try {
            const { loggedIn, user, session, fetch, clear } = useUserSession();
            
            // Refresh auth state
            await fetch();
            
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
    } else {
        // For non-admin routes that require authentication
        const { loggedIn, user, fetch } = useUserSession();
        
        // Refresh auth state
        await fetch();
        
        if (!user.value) {
            return navigateTo('/login');
        }
    }
});