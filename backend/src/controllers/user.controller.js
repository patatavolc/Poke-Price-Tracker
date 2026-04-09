import { claimDailyCoins } from "../services/user.pack.service.js";

export const claimDailyController = async (req, res) => {
  const result = await claimDailyCoins(req.user.id);
  res.json(result);
};
