import { Router } from "express";
import { body } from "express-validator";
import rateLimit from "express-rate-limit";
import { register, login, getMe } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

// Auth-specific rate limiting prevents login/register brute force attempts (OWASP A2). 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

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

router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.get("/me", verifyToken, getMe);

export default router;
