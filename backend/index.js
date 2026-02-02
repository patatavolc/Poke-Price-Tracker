import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./src/config/db.js";
import mainRouter from "./src/routes/mainRouter.js";
import {
  startAllSchedulers,
  getSchedulerStatus,
} from "./src/jobs/scheduler.js";
import { fillInitialPrices } from "./src/jobs/utils/fillInitialPrices.js";

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

// Endpoint manual para llenar los precios
app.post("/api/admin/fill-prices", async (req, res) => {
  try {
    const batchSize = req.query.batch ? parseInt(req.query.batch) : 100;
    const result = await fillInitialPrices(batchSize);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para ver estado del scheduler
app.get("/api/admin/scheduler-status", (req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prueba de conexión a Supabase
async function testDbConnection() {
  try {
    const res = await query("SELECT NOW()");
    console.log("✅ Conexión a Supabase exitosa:", res.rows[0].now);
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error.message);
  }
}

testDbConnection();

// Iniciar schedulers (false = no llenar precios al iniciar)
startAllSchedulers(false);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
