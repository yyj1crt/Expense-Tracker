// chore: centralize express-validator validation result handling
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Centralized validation error handling avoids unsafe request processing and supports OWASP A1 input validation.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map((error) => {
        const field = (error as any).param || (error as any).location || "unknown";
        return {
          field,
          message: error.msg,
        };
      }),
    });
  }
  next();
};
