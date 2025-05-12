export default defineNuxtRouteMiddleware(async (event) => {
    const nonAuthRequiredPaths = ['/login', '/register', '/logout', '/reset-password', '/user/forgot-password'];
    const localeRoute = useLocaleRoute()
    // Get the path without the locale prefix
    const pathWithoutLocale = event.fullPath.replace(/^\/(en|nl)/, '') || '/';

    // Skip auth check for non-auth required paths
    if (nonAuthRequiredPaths.some(path => pathWithoutLocale.startsWith(path))) {
        return;
    }
    
    // Handle admin routes
    if (pathWithoutLocale.startsWith('/admin') || pathWithoutLocale.startsWith('/api/admin')) {
        try {
            const { user, session, fetch } = useUserSession();
            
            // Refresh auth state
            await fetch();
            
            if (!user.value) {
                console.error("User is undefined");
                return navigateTo(localeRoute('/login')?.fullPath || '/login');
            }
            // Add a check for session.value
            if (!session.value || !session.value.isAdmin) {
                console.error("User is not an admin or session is not available");
                return navigateTo(localeRoute('/')?.fullPath || '/');
            }
        } catch (error) {
            console.error("Authentication error", error);
            if (pathWithoutLocale.startsWith('/api/')) {
                throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required" });
            } else {
                return navigateTo(localeRoute('/login')?.fullPath || '/login');
            }
        }
    } else {
        // For non-admin routes that require authentication
        const { user, fetch } = useUserSession();
        
        // Refresh auth state
        await fetch();
        
        if (!user.value) {
            return navigateTo(localeRoute('/login')?.fullPath || '/login');
        }
    }
});