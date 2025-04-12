const { MongoClient } = require('mongodb');

async function main() {
    // Get environment variables with fallbacks
    const uri = process.env.MONGODB_URI || 'mongodb://drankkas:drankkas@localhost:27017/drankkas_db';
    const dbName = process.env.MONGO_INITDB_DATABASE || 'drankkas_db';
    const dbUser = process.env.MONGODB_USER || 'drankkas';
    const dbPassword = process.env.MONGODB_PASSWORD || 'drankkas';
    
    console.log('Connecting to MongoDB URI:', uri);
    
    const client = new MongoClient(uri, {});

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);

        await db.addUser(dbUser, dbPassword, {
            roles: [{ role: 'readWrite', db: dbName }],
        });

        console.log('User created successfully');
    } catch (error) {
        console.error('Error in database initialization:', error);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
