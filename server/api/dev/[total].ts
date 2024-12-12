import { defineEventHandler, readBody } from 'h3';
import { faker } from '@faker-js/faker';

export default defineEventHandler(async (event) => {
    const { total } = event.context.params || {};
    console.log(faker.person.firstName())

});