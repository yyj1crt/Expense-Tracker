import request from "supertest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";

jest.mock("@prisma/client", () => {
  const mUser = {
    findUnique: jest.fn(),
  };
  const mCategory = {
    findUnique: jest.fn(),
  };
  const mTransaction = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: mUser,
      category: mCategory,
      transaction: mTransaction,
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    })),
  };
});

import { app } from "../../app";
import { PrismaClient } from "@prisma/client";

const mockedPrisma = (PrismaClient as jest.Mock).mock.results[0].value as any;

beforeAll(() => {
  process.env.JWT_SECRET = "test-secret";
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Transaction integration tests", () => {
  const userToken = jwt.sign({ id: 1, email: "demo@example.com", role: "USER" }, process.env.JWT_SECRET as string);

  it("returns only the authenticated user's transactions", async () => {
    mockedPrisma.transaction.count.mockResolvedValue(1);
    mockedPrisma.transaction.findMany.mockResolvedValue([
      { id: 1, title: "Test", amount: 50, type: "EXPENSE", date: new Date().toISOString(), categoryId: 1, userId: 1, category: { id: 1, name: "Food" } },
    ]);

    const response = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.transactions).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });

  it("creates a transaction successfully", async () => {
    mockedPrisma.category.findUnique.mockResolvedValue({ id: 1, name: "Food", color: "#ef4444", icon: "🍔" });
    mockedPrisma.transaction.create.mockResolvedValue({
      id: 1,
      title: "Dinner",
      amount: 45,
      type: "EXPENSE",
      date: new Date().toISOString(),
      categoryId: 1,
      note: "Dinner with friends",
      userId: 1,
      category: { id: 1, name: "Food", color: "#ef4444", icon: "🍔" },
    });

    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Dinner", amount: 45, type: "EXPENSE", date: new Date().toISOString(), categoryId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.transaction.title).toBe("Dinner");
  });

  it("fails to create a transaction with invalid data", async () => {
    const response = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "", amount: -5, type: "EXPENSE", date: "invalid-date", categoryId: "not-a-number" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("updates an owned transaction", async () => {
    mockedPrisma.transaction.findUnique.mockResolvedValue({ id: 2, userId: 1, categoryId: 1 });
    mockedPrisma.category.findUnique.mockResolvedValue({ id: 1, name: "Food", color: "#ef4444", icon: "🍔" });
    mockedPrisma.transaction.update.mockResolvedValue({
      id: 2,
      title: "Updated title",
      amount: 60,
      type: "EXPENSE",
      date: new Date().toISOString(),
      categoryId: 1,
      note: "Updated note",
      userId: 1,
      category: { id: 1, name: "Food", color: "#ef4444", icon: "🍔" },
    });

    const response = await request(app)
      .put("/api/transactions/2")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Updated title", amount: 60, type: "EXPENSE", date: new Date().toISOString(), categoryId: 1 });

    expect(response.status).toBe(200);
    expect(response.body.transaction.title).toBe("Updated title");
  });

  it("returns 404 when updating another user's transaction", async () => {
    mockedPrisma.transaction.findUnique.mockResolvedValue({ id: 3, userId: 2, categoryId: 1 });

    const response = await request(app)
      .put("/api/transactions/3")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ title: "Not allowed", amount: 30, type: "EXPENSE", date: new Date().toISOString(), categoryId: 1 });

    expect(response.status).toBe(404);
  });

  it("deletes an owned transaction successfully", async () => {
    mockedPrisma.transaction.findUnique.mockResolvedValue({ id: 4, userId: 1, categoryId: 1 });
    mockedPrisma.transaction.delete.mockResolvedValue({ id: 4 });

    const response = await request(app)
      .delete("/api/transactions/4")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(204);
  });

  it("returns 404 when deleting a non-existent transaction", async () => {
    mockedPrisma.transaction.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/transactions/999")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(404);
  });
});
