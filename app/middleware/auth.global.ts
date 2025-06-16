export default defineNuxtRouteMiddleware(async (event) => {
    const nonAuthRequiredPaths = ['/login', '/register', '/logout', '/reset-password', '/user/forgot-password'];
    const localeRoute = useLocaleRoute()
    // Get the path without the locale prefix
    const pathWithoutLocale = event.fullPath.replace(/^\/(en|nl)/, '') || '/';
    console.log(pathWithoutLocale)
    // Skip auth check for non-auth required paths
    if (nonAuthRequiredPaths.some(path => pathWithoutLocale.startsWith(path))) {
        return;
    }
    
    const { user, session, fetch } = useUserSession();
    
    // Refresh auth state
    await fetch();
    
    // If user is not logged in, redirect to login
    if (!user.value) {
        return navigateTo(localeRoute('/login')?.fullPath || '/login');
    }
    // Check if user has 'stam' or 'admin' role
    const hasRequiredRole = session.value?.isAdmin || session.value?.isStam;
    
    // Handle admin routes
    if (pathWithoutLocale.startsWith('/admin') || pathWithoutLocale.startsWith('/api/admin')) {
        try {
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
    } 
    // Restrict non-admin, non-stam users to only access /user/profile
    else if (!hasRequiredRole && !pathWithoutLocale.startsWith('/user/profile')) {
        return navigateTo(localeRoute('/user/profile')?.fullPath || '/user/profile');
    }
});