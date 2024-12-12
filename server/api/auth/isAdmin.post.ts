import { isAdministrator } from '../../models/user';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { id } = body;
    const isAdmin = await isAdministrator(id);
    if (isAdmin) {
        return {
            status: 200,
            body: {
                message: 'User is an administrator',
            },
        };
    }
    return {
        status: 401,
        body: {
            message: 'User is not an administrator',
        },
    };
});