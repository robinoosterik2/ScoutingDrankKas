import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../utils/mongoose.js';
import { seedDatabase, type SeederCounts } from '../server/utils/seedUtils.js';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scoutingdrankkas';

async function runSeeder() {
  try {
    await connectDB(MONGODB_URI);
    console.log('Connected to MongoDB');
    
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
    
    await disconnectDB();
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
