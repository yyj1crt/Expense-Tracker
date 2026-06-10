// chore: start server application
import { app } from "./app";
import { logger } from "./utils/logger";
import { ensureAdminUser } from "./utils/adminSeed";

const port = process.env.PORT || 4000;

const startServer = async () => {
  await ensureAdminUser();
  app.listen(port, () => {
    logger.info(`Expense Tracker server is running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  logger.error("Server startup failed:", error);
  process.exit(1);
});
