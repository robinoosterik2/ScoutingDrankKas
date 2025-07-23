import User from "@/server/models/user";
import type { H3Event } from "h3";

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
  const currentPath = (event.path || event._path || "").split("?")[0]; // Get path without query params

  // Check if path is in the noneLoginRequiredPaths or starts with /api/auth
  if (
    noneLoginRequiredPaths.includes(currentPath) ||
    currentPath.startsWith("/api/auth")
  ) {
    return;
  }

  // Helper function to handle redirection and errors
  const handleAuthError = (
    event: H3Event,
    isApi: boolean,
    message: string,
    statusCode: number
  ) => {
    if (isApi) {
      if (currentPath.startsWith("/api/")) {
        throw createError({ statusCode: 404, statusMessage: "Not Found" });
      } else {
        throw createError({
          statusCode,
          statusMessage: statusCode === 401 ? "Unauthorized" : "Forbidden",
          message,
        });
      }
    } else {
      return sendRedirect(event, "/login", sanitizeStatusCode(302));
    }
  };

  // Admin route handling (both web and API)
  if (
    currentPath.startsWith("/admin") ||
    currentPath.startsWith("/api/admin")
  ) {
    try {
      const session = await getUserSession(event); // Await the promise
      const user = session?.user as { _id: string } | undefined;

      if (!user) {
        return handleAuthError(
          event,
          currentPath.startsWith("/api/"),
          "Authentication required",
          401
        );
      }

      const hasAdminAccess = await User.hasPermission(user.id, "admin");

      if (!hasAdminAccess) {
        return handleAuthError(
          event,
          currentPath.startsWith("/api/"),
          "Admin access required",
          403
        );
      }
      //If the user is admin, we should just return and let the request go through.
      return;
    } catch (error: unknown) {
      // Handle errors, ensure a proper HTTP response is sent.
      const isApi = currentPath.startsWith("/api/");
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      const statusCode = isApi ? 401 : 302; // Default to 401 for API, 302 for redirect
      return handleAuthError(event, isApi, errorMessage, statusCode);
    }
  }

  // Regular user authentication (non-admin routes)
  try {
    const session = await getUserSession(event);
    const user = session?.user; // Access user property

    if (
      !user &&
      !currentPath.startsWith("/api/") &&
      !currentPath.startsWith("/reset-password")
    ) {
      return sendRedirect(event, "/login", sanitizeStatusCode(302));
    }
    // If the user is logged in, we should just return and let the request go through.
    return;
  } catch (error: unknown) {
    const isApi = currentPath.startsWith("/api/");
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";
    const statusCode = isApi ? 401 : 302;
    return handleAuthError(event, isApi, errorMessage, statusCode);
  }
});
