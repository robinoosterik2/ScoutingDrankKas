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
