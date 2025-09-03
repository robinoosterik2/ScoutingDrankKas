import { defineEventHandler } from "h3";
import prisma from "~/server/utils/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // make sure every field is present
  const { id, name, price, description, stock, categories, imageUrl } = body;
  if (
    !name ||
    !price ||
    !description ||
    !categories ||
    typeof stock !== "number" ||
    !imageUrl
  ) {
    return {
      status: 400,
      body: { message: "Missing fields" },
    };
  }
  // make sure price is a number and not negative and no more than 2 decimal places
  // check if . or , is used as decimal separator
  if (
    body.price.toString().includes(",") ||
    body.price.toString().includes(".")
  ) {
    body.price = body.price.toString().replace(",", ".");
    if (
      isNaN(body.price) ||
      body.price < 0 ||
      body.price.split(".")[1].length > 2
    ) {
      return {
        status: 400,
        body: { message: "Invalid price" },
      };
    }
  } else {
    if (isNaN(body.price) || body.price < 0) {
      return {
        status: 400,
        body: { message: "Invalid price" },
      };
    }
  }

  let ageRestriction = false;
  for (let i = 0; i < categories.length; i++) {
    if (typeof categories[i] !== "string") {
      return {
        status: 400,
        body: { message: "Invalid category" },
      };
    } else {
      const found = await prisma.category.findUnique({ where: { id: Number(categories[i]) } });
      if (!found) {
        return {
          status: 400,
          body: { message: "Category not found" },
        };
      }
      if (found.ageRestriction) {
        ageRestriction = true;
      }
    }
  }

  // Update if id exists
  let found = await prisma.product.findUnique({ where: { id: Number(body.id) } });
  if (found) {
    await prisma.product.update({
      where: { id: Number(body.id) },
      data: {
        name,
        price: Number(price),
        description,
        stock,
        ageRestriction,
        packSize: body.packSize !== undefined ? (body.packSize > 0 ? body.packSize : null) : undefined,
        categories: {
          // reset and set categories
          deleteMany: {},
          create: categories.map((cid: string) => ({ categoryId: Number(cid) })),
        },
      },
    });
    return {
      status: 200,
      body: await prisma.product.findUnique({ where: { id: Number(body.id) } }),
    };
  }
  // Create if name does not exist
  const dup = await prisma.product.findFirst({ where: { name: body.name } });
  if (found) {
    return {
      status: 400,
      body: { message: "Name already exists" },
    };
  }
  body.ageRestriction = ageRestriction;
  // Ensure packSize is valid (null or positive number)
  if (body.packSize !== undefined) {
    body.packSize = body.packSize > 0 ? body.packSize : null;
  }
  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      description,
      stock,
      ageRestriction,
      packSize: body.packSize ?? null,
      imageUrl,
      categories: { create: categories.map((cid: string) => ({ categoryId: Number(cid) })) },
    },
  });
  return {
    status: 200,
    body: product,
  };
});
