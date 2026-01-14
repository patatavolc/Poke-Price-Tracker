import { syncSetsFromAPI } from "../services/pokemon.service";

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
