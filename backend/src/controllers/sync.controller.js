import {
  syncSetsFromAPI,
  syncCardsBySet,
  syncAllCards,
  syncMissingSetsCards,
} from "../services/pokemon.service.js";

import { syncAllPrices, syncMissingPrices } from "../services/price/index.js";

export const syncSets = async (req, res) => {
  try {
    const result = await syncSetsFromAPI();
    res.status(200).json({
      message: "Sets sincronizados correctamente",
      count: result.count,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al sincronizar los datos" });
  }
};

export const syncCards = async (req, res) => {
  const { setId } = req.params;
  try {
    const result = await syncCardsBySet(setId);
    res.status(200).json({
      message: `Cartas del set ${setId} sincronizadas`,
      count: result.count,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Error al sincronizar cartas del set ${setId}` });
  }
};

export const syncAll = (req, res) => {
  // Se quita el await para que no bloquee la respuesta HTTP
  syncAllCards()
    .then((result) => console.log(`Proceso terminado: ${result.total} cartas.`))
    .catch((error) => console.error("Error en segundo plano:", error.message));

  res.status(202).json({
    message:
      "Sincronización masiva iniciada en segundo plano. Revisa la terminal para ver el progreso.",
  });
};

export const syncMissing = async (req, res) => {
  try {
    const result = await syncMissingSetsCards();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const syncPrices = (req, res) => {
  syncAllPrices()
    .then((result) =>
      console.log(
        `Proceso de precios terminado: ${result.successCount} precios sincronizados`,
      ),
    )
    .catch((error) => console.error("Error en segundo plano:", error.message));

  res.status(202).json({
    message:
      "Sincronizacion de TODOS los precios iniciada en segundo plano. Revisa la terminal.",
  });
};

export const syncMissingPricesCtrl = (req, res) => {
  syncMissingPrices()
    .then((result) =>
      console.log(
        `Proceso terminado: ${result.success} precios faltantes sincronizados}`,
      ),
    )
    .catch((error) => console.error("Error en segundo plano:", error.message));

  res.status(202).json({
    message:
      "Sincronizacion de precios faltantes iniciada en segundo plano. Revisa la terminal",
  });
};
