import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

function requireEnv(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

export const config = {
  port,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: requireEnv("JWT_SECRET", "dev-only-change-this-secret-key-32chars"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "TaskManager <noreply@taskmanager.local>",
  },
};
