import { getAvailableSets, openPack } from "../services/pack.service.js";
import { AppError } from "../middleware/errorHandler.js";

export const getAvailableSetsController = async (req, res) => {
  const sets = await getAvailableSets();
  res.json(sets);
};

export const openPackController = async (req, res) => {
  const { set_id } = req.body;
  if (!set_id) throw new AppError("set_id requerido", 400);
  const result = await openPack(req.user.id, set_id);
  res.json(result);
};
