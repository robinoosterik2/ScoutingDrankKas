const noneLoginRequiredPaths = ['/login', '/register', '/api/_auth/session'];

export default defineEventHandler(async (event) => { 
  if (noneLoginRequiredPaths.includes(event._path ?? '') || event._path?.startsWith('/api/auth')) {
    console.log("No login required path");
    return;
  }

  // Handle admin routes for both web and API
  if (event._path?.startsWith('/admin') || event._path?.startsWith('/api/admin')) {
    console.log("Admin required path");
    
    try {
      const result = await getUserSession(event);
      
      // If no user session, handle differently for web vs API
      if (!result.user) {
        console.error("User is undefined");
        
        if (event._path?.startsWith('/api/')) {
          // For API routes, throw an unauthorized error
          throw createError({ 
            statusCode: 401, 
            statusMessage: "Unauthorized",
            message: "Authentication required" 
          });
        } else {
          // For web routes, redirect to login
          return sendRedirect(event, '/login', sanitizeStatusCode(302));
        }
      }
      
      // Check admin status
      const isAdmin = await isAdministrator(result.user._id);
      
      if (!isAdmin) {
        console.error("User is not an admin");
        
        if (event._path?.startsWith('/api/')) {
          // For API routes, throw a forbidden error
          throw createError({ 
            statusCode: 403, 
            statusMessage: "Forbidden",
            message: "Admin access required" 
          });
        } else {
          // For web routes, redirect to login
          return sendRedirect(event, '/login', sanitizeStatusCode(302));
        }
      }
      
    } catch (error) {
      console.error("Authentication error", error);
      
      if (event._path?.startsWith('/api/')) {
        // For API routes, throw appropriate error
        throw createError({ 
          statusCode: 401, 
          statusMessage: "Unauthorized",
          message: error instanceof Error ? error.message : "Authentication failed"
        });
      } else {
        // For web routes, redirect to login
        return sendRedirect(event, '/login', sanitizeStatusCode(302));
      }
    }
  }
  const result = await getUserSession(event);
  if (!result.user) {
    if (!event._path?.startsWith('/api/')) {
      return sendRedirect(event, '/login', sanitizeStatusCode(302));
    }
  }
});