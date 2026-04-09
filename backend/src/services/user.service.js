import { query } from "../config/db.js";

export const createUser = async (username, passwordHash, name) => {
    const text = `
  INSERT INTO users (username, password_hash, name)
  VALUES ($1, $2, $3)
  RETURNING id, username, name, role, coins, created_at
  `;

    const res = await query(text, [username, passwordHash, name]);
    return res.rows[0];
};

export const findUserByUsername = async (username) => {
    const text = "SELECT * FROM users WHERE username = $1";
    const res = await query(text, [username]);
    return res.rows[0];
};

export const findUserById = async (id) => {
    // Se excluye el hash de la contraseña por seguridad
    const text =
        "SELECT id, username, name, role, coins, daily_streak, last_daily_claim, created_at FROM users WHERE id = $1";
    const res = await query(text, [id]);
    return res.rows[0];
};
