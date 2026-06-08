import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = typeof err === "object" && err !== null && "status" in err && typeof (err as { status?: number }).status === "number"
    ? (err as { status: number }).status
    : 500;
  const message = typeof err === "object" && err !== null && "message" in err && typeof (err as { message?: string }).message === "string"
    ? (err as { message: string }).message
    : "Internal Server Error";
  logger.error("Error handled: %s", message, { error: err });
  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { details: err?.stack }),
  });
};
