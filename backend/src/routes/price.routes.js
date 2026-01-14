import express from "express";
import { updatePrice } from "../controllers/price.controller.js";

const router = express.Router();

router.post("/update/:cardId", updatePrice);

export default router;
