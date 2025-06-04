import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { $fetch } from '@nuxt/test-utils';
import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';

import { Product } from '../../server/models/product';
import { Order } from '../../server/models/order';
import { User } from '../../server/models/user';
import { Category } from '../../server/models/category'; // In case needed for product setup

// Assuming app/tests/utils/setup.ts handles global DB setup and teardown

describe('POST /api/orders/create - Stock Logic', () => {
  let mockUser: any;
  let productA: any;
  let productB: any;
  let categoryId: string;

  beforeEach(async () => {
    // 0. Create a category for products
    const category = await Category.create({
      name: faker.commerce.department(),
      ageRestriction: false,
    });
    categoryId = category._id.toString();

    // 1. Create a mock user
    mockUser = await User.create({
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      roles: [], // Add roles if necessary for order creation
      balance: 1000, // Give some balance
    });

    // 2. Create mock products
    productA = await Product.create({
      name: 'Product A',
      description: faker.commerce.productDescription(),
      price: 10,
      categories: [categoryId],
      stock: 10, // Initial stock for Product A
      imageUrl: faker.image.url(),
    });

    productB = await Product.create({
      name: 'Product B',
      description: faker.commerce.productDescription(),
      price: 5,
      categories: [categoryId],
      stock: 5, // Initial stock for Product B
      imageUrl: faker.image.url(),
    });
  });

  // afterEach is handled by global setup.ts to clear collections

  it('should create an order and correctly decrement stock for multiple products', async () => {
    const orderPayload = {
      userId: mockUser._id.toString(),
      products: [
        { productId: productA._id.toString(), count: 3 },
        { productId: productB._id.toString(), count: 2 },
      ],
      // total will be calculated by the endpoint
    };

    const response = await $fetch('/api/orders/create', {
      method: 'POST',
      body: orderPayload,
    });

    expect(response.message).toBe('Order created successfully');

    // Verify stock for Product A
    const updatedProductA = await Product.findById(productA._id);
    expect(updatedProductA?.stock).toBe(10 - 3);

    // Verify stock for Product B
    const updatedProductB = await Product.findById(productB._id);
    expect(updatedProductB?.stock).toBe(5 - 2);

    // Verify order was created
    const ordersCount = await Order.countDocuments({ userId: mockUser._id });
    expect(ordersCount).toBe(1);
  });

  it('should fail to create an order if stock is insufficient for one product and not change stock', async () => {
    const orderPayload = {
      userId: mockUser._id.toString(),
      products: [
        { productId: productA._id.toString(), count: 11 }, // Requesting 11, stock is 10
        { productId: productB._id.toString(), count: 2 },
      ],
    };

    try {
      await $fetch('/api/orders/create', {
        method: 'POST',
        body: orderPayload,
      });
    } catch (error: any) {
      expect(error.statusCode).toBe(400); // Based on the stock check in create.post.ts
      expect(error.data.statusMessage).toContain('Insufficient stock for product: Product A');
    }

    // Verify stock for Product A remains unchanged
    const unchangedProductA = await Product.findById(productA._id);
    expect(unchangedProductA?.stock).toBe(10);

    // Verify stock for Product B remains unchanged (no partial processing)
    const unchangedProductB = await Product.findById(productB._id);
    expect(unchangedProductB?.stock).toBe(5);

    // Verify no order was created
    const ordersCount = await Order.countDocuments({ userId: mockUser._id });
    expect(ordersCount).toBe(0);
  });

  it('should fail to create an order if a product has zero stock and is requested', async () => {
    // Set Product A's stock to 0 for this test
    await Product.findByIdAndUpdate(productA._id, { stock: 0 });
    const currentProductA = await Product.findById(productA._id);
    expect(currentProductA?.stock).toBe(0);


    const orderPayload = {
      userId: mockUser._id.toString(),
      products: [{ productId: productA._id.toString(), count: 1 }],
    };

    try {
      await $fetch('/api/orders/create', {
        method: 'POST',
        body: orderPayload,
      });
    } catch (error: any) {
      expect(error.statusCode).toBe(400);
      expect(error.data.statusMessage).toContain('Insufficient stock for product: Product A');
    }

    // Verify stock for Product A remains 0
    const stillZeroStockProductA = await Product.findById(productA._id);
    expect(stillZeroStockProductA?.stock).toBe(0);

    // Verify no order was created
    const ordersCount = await Order.countDocuments({ userId: mockUser._id });
    expect(ordersCount).toBe(0);
  });

  it('should fail if product in order does not exist and not change stock of other products', async () => {
    const nonExistentProductId = new mongoose.Types.ObjectId().toString();
    const orderPayload = {
      userId: mockUser._id.toString(),
      products: [
        { productId: productA._id.toString(), count: 2 },
        { productId: nonExistentProductId, count: 1 },
      ],
    };

    try {
      await $fetch('/api/orders/create', {
        method: 'POST',
        body: orderPayload,
      });
    } catch (error: any) {
      // The endpoint currently throws a generic 500 if a product isn't found,
      // because the error from `Product.findById` isn't specifically caught and re-thrown as an H3Error.
      // For a more specific test, the endpoint would need to be updated.
      // Given current implementation:
      expect(error.statusCode).toBe(500);
      // Or, if createError is used in the endpoint for product not found:
      // expect(error.statusCode).toBe(400);
      // expect(error.data.statusMessage).toContain('Product not found');
      // For now, let's stick to what the current create.post.ts does (implicit 500 from try-catch)
      expect(error.data.statusMessage).toBe('Error while creating new order');


    }

    // Verify stock for Product A remains unchanged
    const unchangedProductA = await Product.findById(productA._id);
    expect(unchangedProductA?.stock).toBe(10);

    const ordersCount = await Order.countDocuments({ userId: mockUser._id });
    expect(ordersCount).toBe(0);
  });
});
