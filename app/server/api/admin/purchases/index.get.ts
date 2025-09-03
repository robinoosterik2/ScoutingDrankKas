import { defineEventHandler, getQuery, createError } from "h3";
// Not implemented in Prisma schema yet

interface PurchaseQuery {
  page?: string;
  limit?: string;
  searchUser?: string;
  searchProduct?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default defineEventHandler(async (event) => {
  throw createError({ statusCode: 501, statusMessage: 'Purchases API not implemented for Prisma yet' })
});
