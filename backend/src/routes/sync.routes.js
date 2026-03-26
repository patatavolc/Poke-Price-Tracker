import express from "express";
import {
    syncSets,
    syncCards,
    syncAll,
    syncMissing,
    syncPrices,
    syncMissingPricesCtrl,
    updateAllPrices,
    getQueueStatus,
} from "../controllers/sync.controller.js";

const router = express.Router();

router.get("/sets", syncSets);
router.get("/cards/:setId", syncCards);
router.get("/all-cards", syncAll);
router.get("/missing-cards", syncMissing);
router.get("/prices", syncPrices);
router.get("/queue-status", getQueueStatus);
router.get("/missing-prices", syncMissingPricesCtrl);
router.post("/update-all-prices", updateAllPrices);

export default router;
