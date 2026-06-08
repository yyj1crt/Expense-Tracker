import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

// Prisma ORM uses parameterized queries by default, protecting against SQL injection by avoiding string interpolation in SQL statements.
const getDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return { start, end: now };
};

export const getAllTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      type,
      categoryId,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;

    const where: any = { userId };

    if (type && ["INCOME", "EXPENSE"].includes(type)) {
      where.type = type;
    }
    if (categoryId) {
      const categoryIdNumber = Number(categoryId);
      if (!Number.isNaN(categoryIdNumber)) {
        where.categoryId = categoryIdNumber;
      }
    }
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        where.date = { ...where.date, gte: start };
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        where.date = { ...where.date, lte: end };
      }
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: offset,
        take: limitNumber,
      }),
    ]);

    return res.json({
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const transactionId = Number(req.params.id);

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { category: true },
    });
    if (!transaction || transaction.userId !== userId) {
      // Prevent broken access control by ensuring the authenticated user is the owner of the transaction.
      return res.status(404).json({ error: "Transaction not found" });
    }
    return res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { title, amount, type, date, categoryId, note } = req.body as {
      title: string;
      amount: number;
      type: "INCOME" | "EXPENSE";
      date: string;
      categoryId: number;
      note?: string;
    };

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount,
        type,
        date: new Date(date),
        categoryId,
        note,
        userId,
      },
      include: { category: true },
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const transactionId = Number(req.params.id);
    const { title, amount, type, date, categoryId, note } = req.body as {
      title: string;
      amount: number;
      type: "INCOME" | "EXPENSE";
      date: string;
      categoryId: number;
      note?: string;
    };

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.userId !== userId) {
      // Ensure only the owner can update their own transaction record.
      return res.status(404).json({ error: "Transaction not found" });
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        title,
        amount,
        type,
        date: new Date(date),
        categoryId,
        note,
      },
      include: { category: true },
    });

    return res.json({ transaction: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const transactionId = Number(req.params.id);

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.userId !== userId) {
      // Ensure delete actions are only allowed for the transaction owner.
      return res.status(404).json({ error: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id: transactionId } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { start, end } = getDateRange();
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      include: { category: true },
    });

    const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpenses;

    const breakdown = transactions.reduce<Record<string, { categoryId: number; categoryName: string; total: number }>>((acc, tx) => {
      const key = tx.category.name;
      if (!acc[key]) {
        acc[key] = { categoryId: tx.categoryId, categoryName: tx.category.name, total: 0 };
      }
      acc[key].total += tx.amount;
      return acc;
    }, {});

    const monthlyTotals = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === date.getFullYear() && txDate.getMonth() === date.getMonth();
      });
      return {
        month: monthKey,
        income: monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, tx) => sum + tx.amount, 0),
        expenses: monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, tx) => sum + tx.amount, 0),
      };
    });

    return res.json({
      totalIncome,
      totalExpenses,
      balance,
      breakdown: Object.values(breakdown),
      monthlyTotals,
    });
  } catch (error) {
    next(error);
  }
};
