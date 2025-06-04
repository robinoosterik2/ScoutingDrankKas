import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { faker } from '@faker-js/faker'
import { Category } from '../server/models/category'
import { adminRequest } from './utils/auth' // Assuming this works from product.test.ts experience
import mongoose from 'mongoose';

describe('Category API', () => {
    let createdCategoryIds: string[] = [];

    const generateCategoryData = (overrides = {}) => ({
        name: faker.commerce.department() + '-' + faker.string.alphanumeric(5), // Ensure unique name
        ageRestriction: faker.datatype.boolean(),
        ...overrides,
    });

    beforeEach(async () => {
        await Category.deleteMany({});
        createdCategoryIds = [];
    });

    afterEach(async () => {
        if (createdCategoryIds.length > 0) {
            await Category.deleteMany({ _id: { $in: createdCategoryIds } });
        } else {
            // Fallback if IDs weren't collected, clean all for safety, though less ideal
            await Category.deleteMany({});
        }
    });

    // Admin: Create Category
    describe('Admin: Create Category (POST /api/admin/categories/create)', () => {
        it('should create a new category successfully', async () => {
            const categoryData = generateCategoryData();
            const response = await adminRequest('/api/admin/categories/create', {
                method: 'POST',
                body: categoryData,
            });

            // The API returns the request body, not the created object with ID.
            // So we assert based on the input data.
            expect(response.name).toBe(categoryData.name);
            expect(response.ageRestriction).toBe(categoryData.ageRestriction);

            const dbCategory = await Category.findOne({ name: categoryData.name });
            expect(dbCategory).not.toBeNull();
            expect(dbCategory?.name).toBe(categoryData.name);
            expect(dbCategory?.ageRestriction).toBe(categoryData.ageRestriction);
            if (dbCategory?._id) {
                createdCategoryIds.push(dbCategory._id.toString());
            }
        });

        it('should fail to create a category if name is missing', async () => {
            const categoryData = { ageRestriction: false }; // Name is missing
            try {
                await adminRequest('/api/admin/categories/create', {
                    method: 'POST',
                    body: categoryData,
                });
                expect.fail('Request should have failed due to missing name');
            } catch (error: any) {
                // Based on create.post.ts, it throws 500 if body parsing or save fails.
                // It doesn't explicitly check for 'name' presence before `new Category()`.
                // The model validation itself should trigger an error during save.
                // Let's assume the model validation error bubbles up as a 500 or a specific Mongoose validation error.
                // For now, let's expect a 500 as per the catch block in the API.
                // A more robust API would return a 400 for validation.
                expect(error.data?.statusCode || error.statusCode).toBe(500);
            }
        });

        it('should fail to create a category with a duplicate name', async () => {
            const categoryData = generateCategoryData();
            await Category.create(categoryData); // Create first category
            if (categoryData.name) createdCategoryIds.push((await Category.findOne({name: categoryData.name}))!._id.toString());


            try {
                await adminRequest('/api/admin/categories/create', {
                    method: 'POST',
                    body: categoryData, // Attempt to create with the same name
                });
                expect.fail('Request should have failed due to duplicate name');
            } catch (error: any) {
                expect(error.data?.statusCode || error.statusCode).toBe(500); // As create.post.ts throws 500, but contains a 400 for "Category already exists"
                expect(error.data?.statusMessage).toContain("Internal Server Error"); // The specific 400 is caught and re-thrown as 500
            }
        });
    });

    // Public: Fetch All Categories
    describe('Public: Fetch All Categories (GET /api/categories/all)', () => {
        it('should return an array of categories', async () => {
            const cat1Data = generateCategoryData();
            const cat2Data = generateCategoryData();
            const cat1 = await Category.create(cat1Data);
            const cat2 = await Category.create(cat2Data);
            createdCategoryIds.push(cat1._id.toString(), cat2._id.toString());

            const response = await $fetch('/api/categories/all', { method: 'GET' });
            expect(Array.isArray(response)).toBe(true);
            expect(response.length).toBeGreaterThanOrEqual(2);
            expect(response.some((c: any) => c.name === cat1Data.name)).toBe(true);
            expect(response.some((c: any) => c.name === cat2Data.name)).toBe(true);
        });

        it('should return an empty array if no categories exist', async () => {
            const response = await $fetch('/api/categories/all', { method: 'GET' });
            expect(Array.isArray(response)).toBe(true);
            expect(response.length).toBe(0);
        });
    });

    // Public: Fetch Single Category
    describe('Public: Fetch Single Category (GET /api/categories/:id)', () => {
        it('should return a single category by ID', async () => {
            const categoryData = generateCategoryData();
            const createdCategory = await Category.create(categoryData);
            createdCategoryIds.push(createdCategory._id.toString());

            const response = await $fetch(`/api/categories/${createdCategory._id}`, { method: 'GET' });
            expect(response).toBeDefined();
            expect(response._id?.toString()).toBe(createdCategory._id.toString());
            expect(response.name).toBe(categoryData.name);
            expect(response.ageRestriction).toBe(categoryData.ageRestriction);
        });

        it('should return an error if category ID does not exist', async () => {
            const nonExistentId = new mongoose.Types.ObjectId().toString();
            try {
                await $fetch(`/api/categories/${nonExistentId}`, { method: 'GET' });
                expect.fail('Request should have failed for non-existent ID');
            } catch (error: any) {
                // The API throws a generic Error("Category not found") which results in a 500 by default by Nuxt/Nitro
                expect(error.statusCode).toBe(500);
                // A more specific error (e.g., 404) would be better from the API.
            }
        });
    });

    // Admin: Update Category (SKIPPED as endpoint is not implemented)
    // describe('Admin: Update Category (POST /api/admin/categories/put)', () => {
    //     it.skip('should update an existing category successfully', () => { /* ... */ });
    // });

    // Admin: Delete Category (SKIPPED as endpoint is not implemented)
    // describe('Admin: Delete Category', () => {
    //    it.skip('should delete an existing category successfully', () => { /* ... */ });
    // });

    // Access Control
    describe('Access Control', () => {
        it('should deny access to create category for non-admin user', async () => {
            const categoryData = generateCategoryData();
            try {
                await $fetch('/api/admin/categories/create', { // Using normal $fetch, not adminRequest
                    method: 'POST',
                    body: categoryData,
                });
                expect.fail('Request should have been denied for non-admin user');
            } catch (error: any) {
                // Expecting 401 or 403. Nuxt Auth Utils usually returns 401 if session is invalid/missing.
                expect(error.statusCode).toBe(401);
            }
        });
    });
});
