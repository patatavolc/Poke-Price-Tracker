import express from "express";
import { getCardDetails, getCardPrice } from "../controllers/card.controller.js";

const router = express.Router();

router.get("/:id", getCardDetails);
router.get("/price/:id", getCardPrice)

export default router;
