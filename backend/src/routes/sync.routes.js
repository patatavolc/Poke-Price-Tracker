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

router.post("/sets", syncSets);
router.post("/cards/:setId", syncCards);
router.post("/all-cards", syncAll);
router.post("/missing-cards", syncMissing);
router.post("/prices", syncPrices);
router.post("/missing-prices", syncMissingPricesCtrl);
router.get("/queue-status", getQueueStatus);
router.post("/update-all-prices", updateAllPrices);

export default router;
