const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres.uhoghmrbzdlamtgpqqwl:hisobchi1200@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runInitSql() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL!');

        // First delete old mismatched tables
        console.log('Dropping old mismatched tables...');
        await client.query(`
        DROP TABLE IF EXISTS audit_logs CASCADE;
        DROP TABLE IF EXISTS expenses CASCADE;
        DROP TABLE IF EXISTS sale_items CASCADE;
        DROP TABLE IF EXISTS sales CASCADE;
        DROP TABLE IF EXISTS products CASCADE;
        DROP TABLE IF EXISTS user_sessions CASCADE;
        DROP TABLE IF EXISTS subscriptions CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS businesses CASCADE;
    `);

        // Now recreate using the correct full init.sql
        const sqlFilePath = path.join(__dirname, 'init.sql');
        const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('Executing correct init.sql...');
        await client.query(sqlQuery);

        console.log('Successfully initialized all database tables!');
    } catch (err) {
        console.error('Error executing init.sql:', err.stack);
    } finally {
        await client.end();
    }
}

runInitSql();
