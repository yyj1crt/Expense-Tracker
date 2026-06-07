import { Router } from "express";
import { healthCheck } from "../controllers/healthController";
import authRoutes from "./auth.routes";

const router = Router();

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Returns OK status
 */
router.get("/health", healthCheck);
router.use("/auth", authRoutes);

export default router;
