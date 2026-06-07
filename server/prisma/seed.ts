import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Food", color: "#ef4444", icon: "🍔" },
    { name: "Transport", color: "#3b82f6", icon: "🚗" },
    { name: "Shopping", color: "#8b5cf6", icon: "🛍️" },
    { name: "Entertainment", color: "#f59e0b", icon: "🎮" },
    { name: "Salary", color: "#10b981", icon: "💰" },
  ];

  await prisma.category.createMany({ data: categories, skipDuplicates: true });

  const hashedPassword = await bcrypt.hash("Demo1234!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { password: hashedPassword, name: "Demo User" },
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.name, category.id])
  );

  const transactions = [
    {
      title: "Grocery shopping",
      amount: 92.45,
      type: "EXPENSE",
      date: new Date("2026-06-01"),
      note: "Weekly groceries",
      userId: user.id,
      categoryId: categoryMap.Food,
    },
    {
      title: "Uber ride",
      amount: 24.0,
      type: "EXPENSE",
      date: new Date("2026-06-02"),
      note: "Airport transfer",
      userId: user.id,
      categoryId: categoryMap.Transport,
    },
    {
      title: "Online clothes order",
      amount: 150.0,
      type: "EXPENSE",
      date: new Date("2026-06-03"),
      note: "New conference outfit",
      userId: user.id,
      categoryId: categoryMap.Shopping,
    },
    {
      title: "Movie night",
      amount: 42.0,
      type: "EXPENSE",
      date: new Date("2026-06-04"),
      note: "Cinema tickets",
      userId: user.id,
      categoryId: categoryMap.Entertainment,
    },
    {
      title: "Freelance payment",
      amount: 1200.0,
      type: "INCOME",
      date: new Date("2026-06-05"),
      note: "Client invoice #245",
      userId: user.id,
      categoryId: categoryMap.Salary,
    },
    {
      title: "Lunch meeting",
      amount: 45.0,
      type: "EXPENSE",
      date: new Date("2026-06-06"),
      note: "Client lunch",
      userId: user.id,
      categoryId: categoryMap.Food,
    },
    {
      title: "Monthly bus pass",
      amount: 70.0,
      type: "EXPENSE",
      date: new Date("2026-06-07"),
      note: "Public transport",
      userId: user.id,
      categoryId: categoryMap.Transport,
    },
    {
      title: "Gift purchase",
      amount: 80.0,
      type: "EXPENSE",
      date: new Date("2026-06-08"),
      note: "Birthday present",
      userId: user.id,
      categoryId: categoryMap.Shopping,
    },
    {
      title: "Concert tickets",
      amount: 130.0,
      type: "EXPENSE",
      date: new Date("2026-06-09"),
      note: "Live concert",
      userId: user.id,
      categoryId: categoryMap.Entertainment,
    },
    {
      title: "Bonus payout",
      amount: 500.0,
      type: "INCOME",
      date: new Date("2026-06-10"),
      note: "Quarterly bonus",
      userId: user.id,
      categoryId: categoryMap.Salary,
    },
  ];

  await prisma.transaction.createMany({ data: transactions, skipDuplicates: true });

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
