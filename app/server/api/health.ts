export default defineEventHandler(async (event) => {
  try {
    // Basic health check - return 200 OK if server is running
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Health check failed",
    });
  }
});
