const { MongoClient } = require('mongodb');

async function main() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    console.log('uri', uri);
    const client = new MongoClient(uri, {
    });

    try {
        await client.connect();
        const db = client.db('drankkasj_db'); // Create or switch to `drankkasj_db`

        await db.addUser('drankkas', 'drankkas', {
            roles: [{ role: 'readWrite', db: 'drankkasj_db' }],
        });

        console.log('User created successfully');
    } finally {
        await client.close();
    }
}

main().catch(console.error);
