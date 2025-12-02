require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetDatabase() {
    try {
        console.log('🗑️  Apagando banco de dados...');
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

        console.log('✨  Recriando tabelas...');
        const sqlPath = path.join(__dirname, '..', 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);

        console.log('✅  Banco de dados resetado com sucesso!');
    } catch (err) {
        console.error('❌  Erro ao resetar banco de dados:', err);
    } finally {
        await pool.end();
    }
}

resetDatabase();
