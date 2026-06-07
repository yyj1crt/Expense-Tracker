import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

export const getAllCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });
    return res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, color, icon } = req.body as { name: string; color: string; icon: string };

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ error: "Category name already exists" });
    }

    const category = await prisma.category.create({
      data: { name, color, icon },
    });

    return res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categoryId = Number(req.params.id);
    const { name, color, icon } = req.body as { name: string; color: string; icon: string };

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing && existing.id !== categoryId) {
      return res.status(409).json({ error: "Category name already exists" });
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name, color, icon },
    });

    return res.json({ category: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categoryId = Number(req.params.id);
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const transactionCount = await prisma.transaction.count({ where: { categoryId } });
    if (transactionCount > 0) {
      return res.status(400).json({ error: "Category cannot be deleted while transactions reference it" });
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
