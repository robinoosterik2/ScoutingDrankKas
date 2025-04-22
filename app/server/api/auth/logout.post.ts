export default defineEventHandler(async (event) => {
    // Clear the current user session
    await clearUserSession(event);
  
    // Redirect to login page instead of home page
    await sendRedirect(event, "/login", 302);
  });