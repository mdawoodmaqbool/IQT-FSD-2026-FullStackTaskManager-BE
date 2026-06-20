import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

export const config = {
  port,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
};
