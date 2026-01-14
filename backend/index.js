import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./src/config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Prueba de conexion a Supabase
async function testDbConnection() {
  try {
    const res = await query("SELECT NOW()");
    console.log("Conexion a Supabase exitosa:", res.rows[0].now);
  } catch (error) {
    console.error("Error conectando a la base de datos:", error.message);
  }
}

testDbConnection();

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Poke Price Tracker funcionando");
});

app.listen(PORT, () => {
  console.log("Servidor correidno en el puerto", PORT);
});
