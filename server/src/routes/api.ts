import { Router } from "express";
import { healthCheck } from "../controllers/healthController";

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

export default router;
