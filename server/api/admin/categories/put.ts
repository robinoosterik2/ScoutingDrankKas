import { defineEventHandler } from 'h3';
import { Category } from '@/server/models/Category';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    console.log(body);
});
