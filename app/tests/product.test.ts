import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { faker } from '@faker-js/faker'
import { Product } from '../../server/models/product'
import { Category } from '../../server/models/category' // Corrected path
import { adminRequest } from './utils/auth' // Assuming this works or will be addressed

describe('Product API', () => {
	let categoryId: string
	let createdProductId: string | null = null // To store ID of product created in tests

	// Helper to generate unique product data to avoid conflicts
	const generateProductData = (override = {}) => ({
		name: faker.commerce.productName() + '-' + faker.string.uuid(), // Ensure unique name
		description: faker.commerce.productDescription(),
		price: parseFloat(faker.commerce.price({ min: 1, max: 100, dec: 2 })),
		categories: [categoryId],
		// ageRestriction is determined by categories on the backend
		stock: faker.number.int({ min: 0, max: 100 }),
		imageUrl: faker.image.url(),
		...override
	})

	beforeEach(async () => {
		// Clean up any product that might have been left from a previous failed test
		if (createdProductId) {
			try {
				await adminRequest('/api/admin/products/delete', {
					method: 'POST',
					body: { productId: createdProductId }
				});
			} catch (error) {
				// console.warn(`Cleanup failed for product ${createdProductId} in beforeEach:`, error);
			}
			createdProductId = null;
		}
		await Product.deleteMany({}); // Clear products
		await Category.deleteMany({}); // Clear categories for a clean slate

		const category = await Category.create({
			name: faker.commerce.department() + '-' + faker.string.uuid(),
			ageRestriction: false
		})
		categoryId = category._id.toString()
	})

	afterEach(async () => {
		if (createdProductId) {
			try {
				await adminRequest('/api/admin/products/delete', {
					method: 'POST',
					body: { productId: createdProductId }
				});
			} catch (error) {
				// console.warn(`Cleanup failed for product ${createdProductId} in afterEach:`, error);
			}
			createdProductId = null;
		}
		// Additional cleanup to be safe
		await Product.deleteMany({});
		await Category.deleteMany({});
	})

	it('should create a product with a category', async () => {
		const productData = generateProductData()

		const response = await adminRequest('/api/admin/products/update', {
			method: 'POST',
			body: productData
		})

		expect(response.status).toBe(200)
		expect(response.body).toBeDefined()
		expect(response.body.name).toBe(productData.name)
		expect(response.body.description).toBe(productData.description)
		expect(response.body.price).toBe(productData.price.toFixed(2))
		expect(response.body.categories).toContain(categoryId)
		expect(response.body.stock).toBe(productData.stock)
		expect(response.body.imageUrl).toBe(productData.imageUrl)
		expect(response.body._id).toBeDefined()
		createdProductId = response.body._id // Save for cleanup and other tests

		const dbProduct = await Product.findById(createdProductId)
		expect(dbProduct).not.toBeNull()
		expect(dbProduct?.name).toBe(productData.name)
	})

	it('should retrieve a created product', async () => {
		const productData = generateProductData()
		const createdProduct = await Product.create(productData)
		createdProductId = createdProduct._id.toString()

		const response = await $fetch(`/api/products/${createdProductId}`, { method: 'GET' })

		expect(response).toBeDefined()
		expect(response._id).toBe(createdProductId)
		expect(response.name).toBe(productData.name)
		expect(response.categories.map((c:any) => c.toString())).toContain(categoryId) // Category IDs might be objects
	})

	it('should return 400 when retrieving a non-existent product', async () => {
		const nonExistentId = new mongoose.Types.ObjectId().toString();
		try {
			await $fetch(`/api/products/${nonExistentId}`, { method: 'GET' })
		} catch (error: any) {
			expect(error.statusCode).toBe(400) // Based on [id].ts
            expect(error.data.statusMessage).toBe("Product not found")
		}
	})

	it('should retrieve all products', async () => {
		const productData1 = generateProductData()
		const productData2 = generateProductData()
		await Product.create(productData1)
		await Product.create(productData2)

		const response = await $fetch('/api/products/all', { method: 'GET' })

		expect(response).toBeDefined()
		expect(Array.isArray(response)).toBe(true)
		expect(response.length).toBeGreaterThanOrEqual(2)
		expect(response.some((p: any) => p.name === productData1.name)).toBe(true)
		expect(response.some((p: any) => p.name === productData2.name)).toBe(true)
	})

	it('should update a product', async () => {
		const productData = generateProductData()
		const initialProduct = await Product.create(productData)
		createdProductId = initialProduct._id.toString()

		const updatedData = {
			id: createdProductId, // Important for the update endpoint
			name: faker.commerce.productName() + '-updated',
			price: parseFloat(faker.commerce.price({ min: 101, max: 200, dec: 2 })),
			stock: faker.number.int({ min: 101, max: 200 }),
			description: 'Updated Description'
		}

		const response = await adminRequest('/api/admin/products/update', {
			method: 'POST', // API uses POST for update
			body: { ...productData, ...updatedData } // Send full product data with updates
		})

		expect(response.status).toBe(200)
		expect(response.body).toBeDefined()
		expect(response.body._id).toBe(createdProductId)
		expect(response.body.name).toBe(updatedData.name)
		expect(response.body.price).toBe(updatedData.price.toFixed(2))
		expect(response.body.stock).toBe(updatedData.stock)
		expect(response.body.description).toBe(updatedData.description)

		const dbProduct = await Product.findById(createdProductId)
		expect(dbProduct).not.toBeNull()
		expect(dbProduct?.name).toBe(updatedData.name)
		expect(dbProduct?.price).toBe(updatedData.price.toFixed(2))
		expect(dbProduct?.stock).toBe(updatedData.stock)
	})

	it('should return error when updating a non-existent product', async () => {
		const nonExistentId = new mongoose.Types.ObjectId().toString();
		const productData = generateProductData({ id: nonExistentId, name: "Test NonExistent" });

		// The update endpoint creates if ID not found AND name is unique
		// To specifically test "update non-existent", we need to ensure the endpoint
		// would try to update. The current endpoint creates if ID not found.
		// So, this test might behave like a create if name is unique.
		// For a true "update non-existent" test, the API would need to differentiate
		// "create" from "update" more strictly (e.g. PUT for update to /api/admin/products/:id)

		// Current behavior: if ID not found, it tries to create.
		// If name then also exists, it returns { status: 400, body: { message: 'Name already exists' } }
		// If name is unique, it creates.
		// This test will assume we are trying to update using an ID that doesn't exist.
		// The endpoint as written (update.post.ts) will treat this as a create.
		// Let's make the name unique to see it create, or make it conflict to see name error.

		const existingProduct = await Product.create(generateProductData()); // ensure a product exists

		const updateDataForNonExistent = generateProductData({
			id: nonExistentId, // non-existent ID
			name: existingProduct.name // Name that WILL conflict if it tries to create
		});


		const response = await adminRequest('/api/admin/products/update', {
			method: 'POST',
			body: updateDataForNonExistent
		});

		// Since ID doesn't exist, it tries to create. Since name exists, it fails.
		expect(response.status).toBe(400);
		expect(response.body.message).toBe('Name already exists');
	})


	it('should delete a product', async () => {
		const productData = generateProductData()
		const product = await Product.create(productData)
		createdProductId = product._id.toString() // mark for potential auto-cleanup

		const response = await adminRequest('/api/admin/products/delete', {
			method: 'POST',
			body: { productId: createdProductId }
		})

		expect(response.message).toBe(`Successfully deleted product: ${product.name}`)

		const dbProduct = await Product.findById(createdProductId)
		expect(dbProduct).toBeNull()
		createdProductId = null // Product is successfully deleted, no need for afterEach to try again
	})

	it('should return error when deleting a non-existent product', async () => {
		const nonExistentId = new mongoose.Types.ObjectId().toString();
		try {
			await adminRequest('/api/admin/products/delete', {
				method: 'POST',
				body: { productId: nonExistentId }
			})
		} catch (error: any) {
            // The API throws an H3 error which gets translated by $fetch or adminRequest
            // Check what error.data or error.response.data contains
			expect(error.data.statusCode).toBe(404)
			expect(error.data.statusMessage).toBe("Product not found")
		}
	})
})
