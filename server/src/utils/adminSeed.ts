import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const ensureAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@spendwise.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2026!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "System Administrator",
      role: "ADMIN",
    },
  });

  console.log(`Admin account prepared (${adminEmail}).`);
};
