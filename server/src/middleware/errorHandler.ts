import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  logger.error("Error handled: %s", message, { error: err });
  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { details: err?.stack }),
  });
};
