import { describe, it, expect, beforeEach } from 'vitest'
import { $fetch } from '@nuxt/test-utils'
import { faker } from '@faker-js/faker'
import { Product } from '../../server/models/product'
import { Category } from '../server/models/category'
import { adminRequest } from './utils/auth'

describe('Product API', () => {
	let categoryId: string
	let productId: string

	const generateProductData = () => ({
		name: faker.commerce.productName(),
		description: faker.commerce.productDescription(),
		price: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
		categories: [categoryId],
		ageRestriction: false,
		stock: faker.number.int({ min: 1, max: 100 }),
		imageUrl: faker.image.url()
	})

	beforeEach(async () => {
		const category = await Category.create({
			name: faker.commerce.department(),
			ageRestriction: false
		})
		categoryId = category._id.toString()
	})

	it('should create a product with a category', async () => {
		const productData = generateProductData()

	    const response = await adminRequest('/api/admin/products/update', {
			method: 'POST',
			body: productData
		})
        console.log(response)
        console.log(response)
        console.log(response)
        console.log(response)
	})

	// it('should retrieve a created product', async () => {
	// 	const product = await Product.create(generateProductData())
	// 	productId = product._id.toString()

	// 	const response = await $fetch(`/api/products/${productId}`)

	// 	expect(response).toBeDefined()
	// 	expect(response._id).toBe(productId)
	// 	expect(response.categories).toContain(categoryId)
	// })

	// it('should update a product', async () => {
	// 	const product = await Product.create(generateProductData())
	// 	productId = product._id.toString()

	// 	const updatedData = {
	// 		name: faker.commerce.productName(),
	// 		price: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
	// 		stock: faker.number.int({ min: 1, max: 100 })
	// 	}

	// 	const response = await $fetch(`/api/products/${productId}`, {
	// 		method: 'PUT',
	// 		body: updatedData
	// 	})

	// 	expect(response).toBeDefined()
	// 	expect(response._id).toBe(productId)
	// 	expect(response.name).toBe(updatedData.name)
	// 	expect(response.price).toBe(updatedData.price.toString())
	// 	expect(response.stock).toBe(updatedData.stock)
	// })

	// it('should delete a product', async () => {
	// 	const product = await Product.create(generateProductData())
	// 	productId = product._id.toString()

	// 	const response = await $fetch(`/api/products/${productId}`, {
	// 		method: 'DELETE'
	// 	})

	// 	expect(response).toBeDefined()
	// 	expect(response.success).toBe(true)

	// 	const deleted = await Product.findById(productId)
	// 	expect(deleted).toBeNull()
	// })
})

describe('POST /api/admin/products/addstock', () => {
	let testProduct: any;
	const initialStock = 10;

	beforeEach(async () => {
		// Create a category as it's required by product model (based on generateProductData)
		const category = await Category.create({
			name: faker.commerce.department(),
			ageRestriction: false,
		});
		const productData = {
			name: faker.commerce.productName(),
			description: faker.commerce.productDescription(),
			price: parseFloat(faker.commerce.price()),
			categories: [category._id.toString()],
			ageRestriction: false,
			stock: initialStock,
			imageUrl: faker.image.url(),
		};
		testProduct = await Product.create(productData);
	});

	it('should successfully add stock to a product', async () => {
		const quantityToAdd = 5;
		const response = await $fetch('/api/admin/products/addstock', {
			method: 'POST',
			body: {
				productId: testProduct._id.toString(),
				quantity: quantityToAdd,
			},
		});

		expect(response.success).toBe(true);
		expect(response.message).toBe('Stock updated successfully.');
		expect(response.newStock).toBe(initialStock + quantityToAdd);

		const updatedProduct = await Product.findById(testProduct._id);
		expect(updatedProduct?.stock).toBe(initialStock + quantityToAdd);
	});

	it('should return 400 for invalid quantity (0)', async () => {
		const quantityToAdd = 0;
		try {
			await $fetch('/api/admin/products/addstock', {
				method: 'POST',
				body: {
					productId: testProduct._id.toString(),
					quantity: quantityToAdd,
				},
			});
		} catch (error: any) {
			expect(error.statusCode).toBe(400);
			expect(error.data.statusMessage).toBe('Quantity must be a positive number.');
		}

		const product = await Product.findById(testProduct._id);
		expect(product?.stock).toBe(initialStock); // Stock should remain unchanged
	});

	it('should return 400 for invalid quantity (negative)', async () => {
		const quantityToAdd = -5;
		try {
			await $fetch('/api/admin/products/addstock', {
				method: 'POST',
				body: {
					productId: testProduct._id.toString(),
					quantity: quantityToAdd,
				},
			});
		} catch (error: any) {
			expect(error.statusCode).toBe(400);
			expect(error.data.statusMessage).toBe('Quantity must be a positive number.');
		}
		const product = await Product.findById(testProduct._id);
		expect(product?.stock).toBe(initialStock);
	});

	it('should return 400 for missing productId', async () => {
		try {
			await $fetch('/api/admin/products/addstock', {
				method: 'POST',
				body: {
					quantity: 5,
				},
			});
		} catch (error: any) {
			expect(error.statusCode).toBe(400);
			expect(error.data.statusMessage).toBe('Missing productId or quantity in request body.');
		}
	});

	it('should return 400 for missing quantity', async () => {
		try {
			await $fetch('/api/admin/products/addstock', {
				method: 'POST',
				body: {
					productId: testProduct._id.toString(),
				},
			});
		} catch (error: any) {
			expect(error.statusCode).toBe(400);
			expect(error.data.statusMessage).toBe('Missing productId or quantity in request body.');
		}
	});

	it('should return 404 for a non-existent product ID', async () => {
		const nonExistentProductId = new mongoose.Types.ObjectId().toString();
		const quantityToAdd = 5;
		try {
			await $fetch('/api/admin/products/addstock', {
				method: 'POST',
				body: {
					productId: nonExistentProductId,
					quantity: quantityToAdd,
				},
			});
		} catch (error: any) {
			expect(error.statusCode).toBe(404);
			expect(error.data.statusMessage).toBe('Product not found.');
		}
	});
})
