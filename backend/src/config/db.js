import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Helper (hacer queries y loguear errores globales)
export const query = (text, params) => {
    return pool.query(text, params);
};

export const getClient = () => pool.connect();

export default pool;
