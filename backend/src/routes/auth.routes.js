import { Router } from "express";
import { register, login, getProfile, refreshToken } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getProfile); // Ruta protegida
router.post("/refresh", authenticateToken, refreshToken);

export default router;
