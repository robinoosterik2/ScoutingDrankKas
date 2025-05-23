

export default defineEventHandler(async (event) => {
    try {
        const user = await getUserSession(event);
        if (!user) {
            throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required" });
        }
        return { user };
    } catch (error) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized", message: "Authentication required" });
    }
});