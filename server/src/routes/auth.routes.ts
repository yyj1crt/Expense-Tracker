import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validateRequest";

const router = Router();

const registerValidation = [
  body("name").trim().escape().notEmpty().withMessage("Name is required"),
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),
  validateRequest,
];

const loginValidation = [
  body("email").trim().normalizeEmail().isEmail().withMessage("Valid email is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  validateRequest,
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", verifyToken, getMe);

export default router;
