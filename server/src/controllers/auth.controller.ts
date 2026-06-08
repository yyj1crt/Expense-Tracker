import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AuthRequest, LoginBody, RegisterBody } from "../types";
import { sanitiseUser } from "../utils/sanitiseUser";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT_ROUNDS = 12;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be configured and at least 32 characters long");
}

const signToken = (payload: { id: number; email: string; role: string }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body as RegisterBody;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Unable to complete registration" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({
      token,
      user: sanitiseUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginBody;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({
      token,
      user: sanitiseUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    return res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
