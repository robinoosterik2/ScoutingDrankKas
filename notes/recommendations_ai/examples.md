
# Backend Error Handling & Validation Examples

Here are examples of how to implement robust error handling and input validation in your Nuxt 3 / Nitro API routes. These practices are crucial for building a secure and reliable application.

## 1. Robust Error Handling

Good error handling ensures that your application can gracefully handle unexpected situations, such as database connection errors or invalid requests. Instead of letting the server crash, you should catch errors and return a meaningful response to the client.

### Example: Server API Route

This example shows a typical API route that fetches a product by its ID. It includes a `try...catch` block to handle potential errors, such as when the product is not found or when there is a database issue.

```typescript
// server/api/products/[id].get.ts

import { H3Event } from 'h3';
import ProductModel from '~/server/models/product.ts'; // Assuming you have a Mongoose model

export default defineEventHandler(async (event: H3Event) => {
  const productId = event.context.params?.id;

  if (!productId) {
    // Send a 400 Bad Request error if the ID is missing
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Product ID is required.',
    });
  }

  try {
    const product = await ProductModel.findById(productId);

    if (!product) {
      // Send a 404 Not Found error if the product doesn't exist
      throw createError({
        statusCode: 404,
        statusMessage: `Product not found with ID: ${productId}`,
      });
    }

    return product;
  } catch (error: any) {
    // Catch any other potential errors (e.g., database connection issues)
    console.error('Error fetching product:', error);

    // Re-throw as a standard 500 Internal Server Error
    // Avoid leaking sensitive error details to the client.
    throw createError({
      statusCode: 500,
      statusMessage: 'An internal server error occurred.',
    });
  }
});
```

**Key Practices:**

*   **Use `try...catch`:** Wrap your core logic in a `try...catch` block to handle unexpected exceptions.
*   **Use `createError`:** Nuxt 3 provides the `createError` utility to generate standardized error objects with appropriate HTTP status codes.
*   **Specific Error Codes:** Return specific status codes like `400` for bad requests or `404` for missing resources.
*   **Generic 500 Errors:** For unexpected server-side issues, return a generic `500` error to avoid exposing implementation details in the error message.

---

## 2. Server-Side Input Validation

Input validation is a critical security measure. You should **never** trust data that comes from the client. Always validate and sanitize it on the server before using it in your business logic or database queries to prevent vulnerabilities like Cross-Site Scripting (XSS) and NoSQL/SQL Injection.

A popular and powerful library for this is `zod`. You would first need to add it to your project:

```bash
pnpm install zod
```

### Example: Product Creation Route with Zod

This example demonstrates how to validate the request body when creating a new product. It defines a `zod` schema that specifies the expected shape and data types of the incoming data.

```typescript
// server/api/products/create.post.ts

import { H3Event } from 'h3';
import { z } from 'zod';
import ProductModel from '~/server/models/product.ts';

// Define the validation schema for a new product
const ProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  price: z.number().positive('Price must be a positive number'),
  description: z.string().optional(),
  categoryId: z.string(), // Assuming category ID is a string
});

export default defineEventHandler(async (event: H3Event) => {
  // Read the body of the request
  const body = await readBody(event);

  // Validate the body against the schema
  const validationResult = ProductSchema.safeParse(body);

  if (!validationResult.success) {
    // If validation fails, return a 400 error with details
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: validationResult.error.errors, // Provides detailed validation errors
    });
  }

  // At this point, `validationResult.data` is type-safe and validated
  const { name, price, description, categoryId } = validationResult.data;

  try {
    const newProduct = new ProductModel({
      name,
      price,
      description,
      category: categoryId,
    });

    await newProduct.save();

    return { message: 'Product created successfully', product: newProduct };
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating product in the database.',
    });
  }
});
```

**Key Practices:**

*   **Define a Schema:** Use `zod` to create a clear, declarative schema for your expected input.
*   **Use `safeParse`:** This method doesn't throw an error on failure. Instead, it returns a result object that you can check, which allows for more graceful error handling.
*   **Return Detailed Errors:** When validation fails, return the `error.errors` from `zod` to the client (during development) to make debugging easier. For production, you might choose to log these details on the server instead of exposing them.
*   **Proceed with Validated Data:** Only use the data from `validationResult.data` in your application logic, as it has been confirmed to match your schema.
