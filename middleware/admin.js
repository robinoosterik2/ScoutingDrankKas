import { isAdministrator } from '@/server/models/user';

export default defineNuxtRouteMiddleware(async () => {
    const { user } = useUserSession();
    // return
    if (!user.value) {
        return navigateTo('/login');
    }
    const id = user.value._id;
    const isAdmin = await isAdministrator(id);
    if (!isAdmin) {
        return navigateTo('/');
    }
})