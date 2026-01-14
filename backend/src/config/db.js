import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false, // Obligatorio para Supabase
  },
});

// Helper (hacer queries y loguear errores globales)
export const query = (text, params) => {
  return pool.query(text, params);
};

export default pool;
