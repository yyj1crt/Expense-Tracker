import { NextFunction, Request, Response } from "express";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const sanitiseValue = (value: any): any => {
  if (typeof value === "string") {
    return stripHtml(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitiseValue);
  }

  if (value && typeof value === "object") {
    return sanitiseObject(value);
  }

  return value;
};

const sanitiseObject = (input: Record<string, unknown>) => {
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
