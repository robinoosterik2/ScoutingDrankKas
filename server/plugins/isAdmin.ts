import { isAdministrator } from '@/server/models/user';

export default defineNitroPlugin((nitroApp) => {
    // console.log('Admin middleware loaded', nitroApp);
    // nitroApp.use(async (req, res, next) => {
    //     const { id } = req.body;
    //     const isAdmin = await isAdministrator(id);
    //     if (isAdmin) {
    //         next();
    //     } else {
    //         res.status(401).send({ message: 'User is not an administrator' });
    //     }
    // });
});