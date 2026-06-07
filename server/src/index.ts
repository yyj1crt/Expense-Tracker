import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import apiRouter from "./routes/api";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 4000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for the Expense Tracker backend",
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  logger.info(`Expense Tracker server is running on http://localhost:${port}`);
});
