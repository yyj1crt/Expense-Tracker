import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";

jest.mock("@prisma/client", () => {
  const mUser = {
    findUnique: jest.fn(),
    create: jest.fn(),
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

describe("Auth integration tests", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      mockedPrisma.user.create.mockResolvedValue({
        id: 1,
        email: "demo@example.com",
        name: "Demo User",
        role: "USER",
        password: "hashedpassword",
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "demo@example.com", name: "Demo User", password: "Demo1234!" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("demo@example.com");
      expect(mockedPrisma.user.create).toHaveBeenCalled();
    });

    it("returns 409 when email already exists", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({ id: 1, email: "demo@example.com" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "demo@example.com", name: "Demo User", password: "Demo1234!" });

      expect(response.status).toBe(409);
      expect(response.body.error).toMatch(/already registered/i);
    });

    it("returns 400 for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid-email", name: "Demo User", password: "Demo1234!" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });

    it("returns 400 for weak password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "demo2@example.com", name: "Demo User", password: "weakpass" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("errors");
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in successfully with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("Demo1234!", 10);
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "demo@example.com",
        name: "Demo User",
        role: "USER",
        password: hashedPassword,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "demo@example.com", password: "Demo1234!" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("demo@example.com");
    });

    it("returns 401 for wrong password", async () => {
      const hashedPassword = await bcrypt.hash("Demo1234!", 10);
      mockedPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "demo@example.com",
        name: "Demo User",
        role: "USER",
        password: hashedPassword,
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "demo@example.com", password: "Wrong123" });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid email or password/i);
    });

    it("returns 401 for non-existent user", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "missing@example.com", password: "Demo1234!" });

      expect(response.status).toBe(401);
      expect(response.body.error).toMatch(/invalid email or password/i);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user with valid token", async () => {
      const token = jwt.sign({ id: 1, email: "demo@example.com", role: "USER" }, process.env.JWT_SECRET as string);
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("demo@example.com");
    });

    it("returns 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.value");

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("returns 401 without token", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
