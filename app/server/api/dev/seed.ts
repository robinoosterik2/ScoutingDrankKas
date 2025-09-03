import { defineEventHandler, readBody } from 'h3';
import { seedDatabase, type SeederCounts } from '../../utils/seedUtils';

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    });
  }

  try {
    // Parse request body for custom counts
    const body = await readBody(event);
    const counts: SeederCounts = body.counts || {};
    
    console.log('Starting database seeding via API with counts:', counts);
    
    // Seed the database
    const result = await seedDatabase(counts);
    
    return {
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: result.users.length,
        categories: result.categories.length,
        products: result.products.length,
        orders: result.orders.length,
        roles: result.roles.length
      }
    };
  } catch (error) {
    console.error('Error seeding database via API:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to seed database',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    };
  }
});
