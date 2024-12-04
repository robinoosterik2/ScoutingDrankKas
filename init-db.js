const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient('mongodb://drankkas:drankkas@localhost:27017', {
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
