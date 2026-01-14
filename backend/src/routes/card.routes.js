import express from "express";
import { getCardDetails } from "../controllers/card.controller.js";

const router = express.Router();

router.get("/:id", getCardDetails);

export default router;
