import cron from "node-cron";
import { query } from "../config/db.js";
import { syncSetsFromAPI, syncAllCards } from "./pokemon.service.js";
import { syncAggregatedPrice } from "./priceAggregator.service.js";
import { updateCardPrice } from "./price.service.js";

// Sincroniza sets cada 24 horas (a las 3AM)
export const scheduleSetSync = () => {
  cron.schedule("0 3 * * *", async () => {
    console.log("Sincronizando sets programado...");
    try {
      await syncSetsFromAPI();
      console.log("Sets sincronizados correctamente");
    } catch (error) {
      console.error("Error sincronizando sets:", error.message);
    }
  });
  console.log("Tarea programada: Sincronizacion de sets (3 AM diaria)");
};

//
