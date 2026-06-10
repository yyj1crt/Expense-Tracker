import { NextFunction, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types";

const prisma = new PrismaClient();

export const getAdminDashboard = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalCategories, totalTransactions, incomeAggregate, expenseAggregate, usersByRole, transactionsByType, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.category.count(),
        prisma.transaction.count(),
        prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "INCOME" } }),
        prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: "EXPENSE" } }),
        prisma.user.groupBy({
          by: ["role"],
          _count: { _all: true },
          orderBy: { role: "asc" },
        }),
        prisma.transaction.groupBy({
          by: ["type"],
          _count: { _all: true },
          _sum: { amount: true },
          orderBy: { type: "asc" },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        }),
      ]);

    return res.json({
      data: {
        totalUsers,
        totalCategories,
        totalTransactions,
        totalIncome: incomeAggregate._sum.amount ?? 0,
        totalExpenses: expenseAggregate._sum.amount ?? 0,
        usersByRole: usersByRole.map((entry) => ({ role: entry.role, count: entry._count._all })),
        transactionsByType: transactionsByType.map((entry) => ({
          type: entry.type,
          count: entry._count._all,
          totalAmount: entry._sum.amount ?? 0,
        })),
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { transactions: true } },
      },
    });

    return res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "User ID must be a valid number" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "User authentication required" });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ error: "Administrators cannot delete their own account" });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUser.role === "ADMIN") {
      return res.status(403).json({ error: "Admin accounts cannot be deleted" });
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
