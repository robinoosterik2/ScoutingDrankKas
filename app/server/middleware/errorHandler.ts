import { H3Event, send, setResponseStatus } from 'h3'; // Added send and setResponseStatus

/**
 * Nitro plugin to set up global error handling for the server.
 * It hooks into Nitro's error handling lifecycle.
 * This setup includes two parts:
 * 1. A low-level hook ('error') for comprehensive error logging.
 * 2. A universal error handler (`defineErrorHandler`) for formatting and sending
 *    standardized JSON error responses for API routes (`/api/**`).
 *
 * For non-API routes, it allows Nuxt's default HTML error page rendering to take over.
 */
export default defineNitroPlugin((nitroApp) => {
  /**
   * Low-level Nitro hook that is called for any unhandled error in the server.
   * Its primary purpose here is to log the raw error details for server-side debugging.
   * @param {Error} error - The error object.
   * @param {{ event: H3Event }} context - Context object containing the H3Event.
   */
  nitroApp.hooks.hook('error', async (error: Error, { event }: { event: H3Event }) => {
    console.error(`[Nitro Error Hook] Path: ${event.path}`, error);
    // Note: This hook is primarily for logging. Modifying the response here can be complex
    // and might interfere with other error handling mechanisms.
  });

  /**
   * Universal error handler applied to all routes ('/**').
   * This function catches errors that occur during request processing (including H3Errors thrown by `createError`).
   * It logs the error and sends a standardized JSON response for API routes.
   * For non-API routes, it allows default error handling to proceed (e.g., Nuxt HTML error page).
   * @param {any} error - The error object. Can be an H3Error or any other error.
   * @param {H3Event} event - The H3 event object.
   */
  nitroApp.router.use('/**', defineErrorHandler(async (error: any, event: H3Event) => {
    const displayError = error.cause || error; // Prefer error.cause if it's a wrapped error by Nitro/H3
    console.error(`[Nitro ErrorHandler] Path: ${event.path}`, displayError);

    // If the error is already an H3Error (e.g., from createError), it might have statusCode.
    // Nuxt's createError utility produces H3Error.
    const statusCode = error.statusCode || 500;
    const statusMessage = error.statusMessage || 'Internal ServerError'; // Nuxt 3 uses statusMessage
    const message = error.message || 'An unexpected error occurred.'; // Generic message

    // For client-side, Nuxt might handle this differently. This is primarily for server API routes.
    // Check if the response has already been sent
    if (event.node.res.headersSent) {
      console.error('Headers already sent, cannot send error response.');
      return;
    }

    // Send a standardized JSON error response
    // This is especially for API routes (e.g., /api/**)
    if (event.path?.startsWith('/api/')) {
      setResponseStatus(event, statusCode);
      await send(event, JSON.stringify({
        statusCode: statusCode,
        statusMessage: statusMessage, // Standard HTTP status message
        message: message, // More specific error message if available from error object
        // Optionally, include stack in development
        stack: process.env.NODE_ENV === 'development' && error.stack ? error.stack.split('\n') : undefined,
        data: error.data || undefined, // Include additional data if provided by createError
      }), 'application/json');
    } else {
      // For non-API routes, Nuxt's default error page rendering should take over.
      // We might not need to do anything here, or just ensure the error is propagated.
      // Re-throwing or letting Nitro handle it might be appropriate.
      // If we send a response here, it might override Nuxt's HTML error page.
      // For now, focus on API errors.
      // If error.cause is set, it implies it might have been wrapped by Nitro/H3.
      // If we don't handle it here, Nitro's default error handling will take over.
    }
  }));
});
