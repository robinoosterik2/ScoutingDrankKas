import { defineEventHandler } from 'h3';
import { Product } from '@/server/models/product';
import { Category } from '@/server/models/category';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    // make sure every field is present
    let { id, name, price, description, stock, categories, imageUrl } = body;
    if (!name || !price || !description || !categories || (typeof stock !== 'number') || !imageUrl) {
        return {
            status: 400,
            body: { message: 'Missing fields' }
        };
    }
    // make sure price is a number and not negative and no more than 2 decimal places
    // check if . or , is used as decimal separator
    if (body.price.toString().includes(',') || body.price.toString().includes('.')) {
         body.price = body.price.toString().replace(',', '.');
         if (isNaN(body.price) || body.price < 0 || body.price.split('.')[1].length > 2) {
            return {
                status: 400,
                body: { message: 'Invalid price' }
            };
        }
    } else {
        if (isNaN(body.price) || body.price < 0) {
            return {
                status: 400,
                body: { message: 'Invalid price' }
            };
        }
    }

    let ageRestriction = false;
    for (let i = 0; i < categories.length; i++) {
        if (typeof categories[i] !== 'string') {
            return {
                status: 400,
                body: { message: 'Invalid category' }
            };
        } else {
            let found = await Category.findById(categories[i]);
            if (!found) {
                return {
                    status: 400,
                    body: { message: 'Category not found' }
                };
            }
            if (found.ageRestriction) {
                ageRestriction = true;
            }
        }
    }

    // Update if id exists
    let found = await Product.findById(body.id);
    if (found) {
        found.name = name;
        found.price = price;
        found.description = description;
        found.stock = stock;
        found.ageRestriction = ageRestriction
        await found.save();
        return {
            status: 200,
            body: found
        };
    }
    // Create if name does not exist
    found = await Product.findOne({ "name": body.name });
    if (found) {
        return {
            status: 400,
            body: { message: 'Name already exists' }
        };
    }
    body.ageRestriction = ageRestriction;
    let product = new Product(body);
    await product.save();
    return {
        status: 200,
        body: product
    };
});
