import { Router } from "express";
import { param } from "express-validator";
import { getAdminDashboard, getAllUsers, deleteUser } from "../controllers/admin.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

router.get("/dashboard", verifyToken, requireRole("ADMIN"), getAdminDashboard);
router.get("/users", verifyToken, requireRole("ADMIN"), getAllUsers);
router.delete(
  "/users/:id",
  verifyToken,
  requireRole("ADMIN"),
  [param("id").isInt().withMessage("User ID must be an integer"), validateRequest],
  deleteUser
);

export default router;
