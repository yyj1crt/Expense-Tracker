// feat: configure secure HTTP middleware and API routing
import "dotenv/config";
import express, { type RequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./routes/api";
import { errorHandler } from "./middleware/errorHandler";
import { sanitiseRequest } from "./middleware/sanitise.middleware";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL must be set in environment variables");
}

// General rate limiting to reduce brute force and denial of service risks (OWASP A6/A7).
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for the Expense Tracker backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Helmet hardening: content security policy, HSTS, no-sniff, frameguard, and XSS protections.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "connect-src": ["'self'", FRONTEND_URL],
        "font-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: "deny" },
  })
);

// Apply additional XSS filtering when available.
const helmetModule = helmet as unknown as { xssFilter?: () => RequestHandler };
app.use(helmetModule.xssFilter ? helmetModule.xssFilter() : (_req, _res, next) => next());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL || "",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Input sanitisation removes HTML tags and trims strings in body, params, and query values.
app.use(sanitiseRequest);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", generalLimiter, apiRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export { app };
