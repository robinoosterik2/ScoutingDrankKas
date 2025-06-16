import { isAdministrator } from "@/server/models/user";

const noneLoginRequiredPaths = [
  "/",
  "/login",
  "/register",
  "/api/_auth/session",
  "/logout",
  "",
  "/reset-password",
];

export default defineEventHandler(async (event) => {
  const path = event.path || event._path; // Use both, event.path is preferred.

  if (noneLoginRequiredPaths.includes(path) || path?.startsWith("/api/auth")) {
    return;
  }

  // Helper function to handle redirection and errors
  const handleAuthError = (event: any, isApi: boolean, message: string, statusCode: number) => {
    if (isApi) {
      throw createError({
        statusCode,
        statusMessage: statusCode === 401 ? "Unauthorized" : "Forbidden",
        message,
      });
    } else {
      return sendRedirect(event, "/login", sanitizeStatusCode(302));
    }
  };

  // Admin route handling (both web and API)
  if (path?.startsWith("/admin") || path?.startsWith("/api/admin")) {
    try {
      const session = await getUserSession(event); // Await the promise
      const user = session?.user;

      if (!user) {
        return handleAuthError(
          event,
          path.startsWith("/api/"),
          "Authentication required",
          401
        );
      }

      const isAdmin = await isAdministrator(user._id); // Await the promise

      if (!isAdmin) {
        return handleAuthError(
          event,
          path.startsWith("/api/"),
          "Admin access required",
          403
        );
      }
      //If the user is admin, we should just return and let the request go through.
      return;

    } catch (error: any) {
        // Handle errors, ensure a proper HTTP response is sent.
        const isApi = path.startsWith("/api/");
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        const statusCode = isApi ? 401 : 302; // Default to 401 for API, 302 for redirect
        return handleAuthError(event, isApi, errorMessage, statusCode);

    }
  }

  // Regular user authentication (non-admin routes)
  try {
    const session = await getUserSession(event);
    const user = session?.user; // Access user property

    if (!user && !path?.startsWith('/api/') && !path?.startsWith('/reset-password')) {
      return sendRedirect(event, "/login", sanitizeStatusCode(302));
    }
    //If the user is logged in, we should just return and let the request go through.
    return;

  } catch (error: any) {
        const isApi = path.startsWith("/api/");
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        const statusCode = isApi ? 401 : 302;
        return handleAuthError(event, isApi, errorMessage, statusCode);
  }
});
