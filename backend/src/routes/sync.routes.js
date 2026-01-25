import express from "express";
import {
  syncSets,
  syncCards,
  syncAll,
  syncMissing,
  syncPrices,
  syncMissingPricesCtrl,
} from "../controllers/sync.controller.js";

const router = express.Router();

router.get("/sets", syncSets);
router.get("/cards/:setId", syncCards);
router.get("/all-cards", syncAll);
router.get("/missing-cards", syncMissing);
router.get("/prices", syncPrices);
router.get("/missing-prices", syncMissingPricesCtrl);

export default router;
