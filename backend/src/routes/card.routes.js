import express from "express";
import {
  getCardDetails,
  getCardPrice,
  getCardsFromSet,
} from "../controllers/card.controller.js";

const router = express.Router();

router.get("/:id", getCardDetails);
router.get("/price/:id", getCardPrice);
router.get("/set/:set_id", getCardsFromSet);
export default router;
