const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.uhoghmrbzdlamtgpqqwl:hisobchi1200@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runInitSql() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL!');

        const sqlFilePath = path.join(__dirname, 'init.sql');
        const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing init.sql...');
        await client.query(sqlQuery);

        console.log('Successfully initialized all database tables!');
    } catch (err) {
        console.error('Error executing init.sql:', err.stack);
    } finally {
        await client.end();
    }
}

runInitSql();
