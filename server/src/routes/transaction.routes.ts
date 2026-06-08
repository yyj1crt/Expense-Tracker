// feat: transaction routes with request validation and access control
import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} from "../controllers/transaction.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     summary: Get a list of transactions for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction list
 */
router.get(
  "/",
  verifyToken,
  [
    query("type").optional().isIn(["INCOME", "EXPENSE"]),
    query("categoryId").optional().toInt(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("page").optional().toInt(),
    query("limit").optional().toInt(),
    validateRequest,
  ],
  getAllTransactions
);

/**
 * @openapi
 * /api/transactions/summary:
 *   get:
 *     summary: Get transaction summary for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 */
router.get("/summary", verifyToken, getSummary);

const transactionValidation = [
  body("title").trim().escape().notEmpty().withMessage("Title is required").isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("type").isIn(["INCOME", "EXPENSE"]).withMessage("Type must be INCOME or EXPENSE"),
  body("date").isISO8601().withMessage("Date must be valid"),
  body("categoryId").isInt().withMessage("CategoryId must be an integer"),
  body("note").optional().trim().escape().isLength({ max: 500 }).withMessage("Note cannot exceed 500 characters"),
  validateRequest,
];

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               date:
 *                 type: string
 *                 format: date
 *               categoryId:
 *                 type: integer
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post("/", verifyToken, transactionValidation, createTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *   get:
 *     summary: Get a transaction by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Transaction details
 */
router.get(
  "/:id",
  verifyToken,
  [param("id").isInt().withMessage("Transaction ID must be an integer"), validateRequest],
  getTransactionById
);

/**
 * @openapi
 * /api/transactions/{id}:
 *   put:
 *     summary: Update a transaction
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
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               date:
 *                 type: string
 *                 format: date
 *               categoryId:
 *                 type: integer
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.put("/:id", verifyToken, [param("id").isInt().withMessage("Transaction ID must be an integer"), ...transactionValidation], updateTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
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
 *         description: Transaction deleted
 */
router.delete(
  "/:id",
  verifyToken,
  [param("id").isInt().withMessage("Transaction ID must be an integer"), validateRequest],
  deleteTransaction
);

export default router;
