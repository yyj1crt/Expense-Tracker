import { Router } from "express";
import { body, param } from "express-validator";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Retrieve all categories with transaction counts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", verifyToken, getAllCategories);

const categoryValidation = [
  body("name").trim().escape().notEmpty().withMessage("Category name is required"),
  body("color")
    .trim()
    .matches(/^#([0-9A-Fa-f]{6})$/)
    .withMessage("Color must be a valid hex code"),
  body("icon").trim().escape().notEmpty().withMessage("Icon is required"),
  validateRequest,
];

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/", verifyToken, requireRole("ADMIN"), categoryValidation, createCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Update an existing category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/:id", verifyToken, requireRole("ADMIN"), [
  param("id").isInt().withMessage("Category id must be an integer"),
  ...categoryValidation,
], updateCategory);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.delete("/:id", verifyToken, requireRole("ADMIN"), [
  param("id").isInt().withMessage("Category id must be an integer"),
  validateRequest,
], deleteCategory);

export default router;
