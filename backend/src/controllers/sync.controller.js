import {
  syncSetsFromAPI,
  syncCardsBySet,
  syncAllCards,
} from "../services/pokemon.service.js";

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

export const syncAll = async (req, res) => {
  try {
    const result = await syncAllCards();
    res.status(200).json({
      message: "Sincronizacion masiva completada",
      totalCards: result.total,
    });
  } catch (error) {
    res.status(500).json({ error: "Error en la sincronizacion masiva" });
  }
};
