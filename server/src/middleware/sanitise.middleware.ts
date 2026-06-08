// feat: sanitize all request payloads to reduce XSS and injection risk
import { NextFunction, Request, Response } from "express";

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, "").trim();

const sanitiseValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return stripHtml(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitiseValue);
  }

  if (value && typeof value === "object") {
    return sanitiseObject(value as Record<string, unknown>);
  }

  return value;
};

const sanitiseObject = (input: Record<string, unknown>): Record<string, unknown> => {
  return Object.keys(input).reduce<Record<string, unknown>>((sanitised, key) => {
    sanitised[key] = sanitiseValue(input[key]);
    return sanitised;
  }, {});
};

export const sanitiseRequest = (req: Request, _res: Response, next: NextFunction) => {
  req.body = sanitiseObject(req.body || {});
  req.params = sanitiseObject(req.params || {});
  req.query = sanitiseObject(req.query || {});
  next();
};
