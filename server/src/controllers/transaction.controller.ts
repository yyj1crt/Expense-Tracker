// feat: transaction controller with ownership enforcement and SQL injection protection
import { NextFunction, Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
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

    const where: Prisma.TransactionWhereInput = { userId: req.user!.id };
    let dateFilter: Prisma.DateTimeFilter | undefined;

    if (type && ["INCOME", "EXPENSE"].includes(type)) {
      where.type = type as any;
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
        dateFilter = { ...dateFilter, gte: start };
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        dateFilter = { ...dateFilter, lte: end };
      }
    }
    if (dateFilter) {
      where.date = dateFilter;
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
      data: {
        transactions,
        total,
        page: pageNumber,
        limit: limitNumber,
      },
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
    return res.json({ data: transaction });
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

    return res.status(201).json({ data: transaction });
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

    return res.json({ data: updated });
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

    // Ensure we explicitly filter by the authenticated user's id
    const userIdFilter = req.user?.id;
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userIdFilter,
        date: { gte: start, lte: end },
      },
      include: { category: true },
    });

    // Default values when there are no transactions
    if (!transactions || transactions.length === 0) {
      return res.json({
        data: {
          totalIncome: 0,
          totalExpenses: 0,
          balance: 0,
          byCategory: [],
          monthlyTotals: [],
        },
      });
    }

    const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, tx) => sum + tx.amount, 0);
    const balance = totalIncome - totalExpenses;

    const breakdown = transactions.reduce<Record<string, { categoryId: number; category: { id: number; name: string; color: string }; amount: number; percentage?: number }>>((acc, tx) => {
      const key = tx.category.name;
      if (!acc[key]) {
        acc[key] = { categoryId: tx.categoryId, category: { id: tx.categoryId, name: tx.category.name, color: tx.category.color }, amount: 0 } as any;
      }
      acc[key].amount += tx.amount;
      return acc;
    }, {});

    // Turn breakdown into array and compute percentages
    const byCategory = Object.values(breakdown);
    const totalForPercentage = byCategory.reduce((s, b) => s + b.amount, 0) || 0;
    byCategory.forEach((b) => {
      b.percentage = totalForPercentage > 0 ? (b.amount / totalForPercentage) * 100 : 0;
    });

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
      data: {
        totalIncome,
        totalExpenses,
        balance,
        byCategory,
        monthlyTotals,
      },
    });
  } catch (error) {
    // Return explicit 500 with a clear message for debugging and client display
    console.error("Error in getSummary:", error);
    return res.status(500).json({ error: "Failed to compute transaction summary. Please try again later." });
  }
};
