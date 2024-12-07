import { isAdministrator } from '../../models/user';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    console.log(event);
});