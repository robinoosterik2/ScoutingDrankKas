import { seedDatabase, type SeederCounts } from '../server/utils/seedUtils.js';

async function runSeeder() {
  try {
    const counts = getCountsFromArgs();
    console.log('Starting database seeding with counts:', counts);
    
    const result = await seedDatabase(counts);
    console.log('Database seeded successfully!');
    console.log('Created:', {
      users: result.users.length,
      categories: result.categories.length,
      products: result.products.length,
      orders: result.orders.length,
      roles: result.roles.length
    });
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

function getCountsFromArgs(): SeederCounts {
  const args = process.argv.slice(2);
  const counts: SeederCounts = {};
  
  for (const arg of args) {
    if (arg.startsWith('--users=')) {
      counts.users = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--categories=')) {
      counts.categories = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--products=')) {
      counts.products = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--orders=')) {
      counts.orders = parseInt(arg.split('=')[1], 10) || 0;
    }
  }
  
  return counts;
}

// Run the seeder
runSeeder();
