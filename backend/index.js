import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./src/config/db.js";
import mainRouter from "./src/routes/mainRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API de Poke Price Tracker funcionando");
});
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

app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto", PORT);
});
