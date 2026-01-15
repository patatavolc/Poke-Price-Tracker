import express from "express";
import {
  updatePrice,
  updateAggregatedPrice,
} from "../controllers/price.controller.js";

const router = express.Router();

router.post("/update/:cardId", updatePrice);
router.post("/update-aggregated/:cardId", updateAggregatedPrice);

export default router;
