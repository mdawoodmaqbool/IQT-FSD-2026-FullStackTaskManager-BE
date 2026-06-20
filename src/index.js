import { createApp } from "./app.js";
import { config } from "./config.js";
import { prisma } from "./db/prisma.js";

async function start() {
  if (!config.databaseUrl) {
    console.error("DATABASE_URL is not set. Check your .env file.");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    const app = await createApp();

    app.listen(config.port, () => {
      console.log(`TaskManager API running on http://localhost:${config.port}`);
      console.log(`GraphQL endpoint: http://localhost:${config.port}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
