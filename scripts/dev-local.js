import { execSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const schemaPath = path.join(rootDir, "prisma", "schema.sqlite.prisma");
const dbUrl = "file:./prisma/dev.db";

process.env.DATABASE_URL = dbUrl;

console.log("Setting up local SQLite database...");

execSync(`npx prisma db push --schema "${schemaPath}"`, {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: dbUrl },
});

execSync(`npx prisma generate --schema "${schemaPath}"`, {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: dbUrl },
});

console.log("Starting API server...");

const child = spawn("node", ["--watch", "src/index.js"], {
  cwd: rootDir,
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: dbUrl },
});

child.on("exit", (code) => process.exit(code ?? 0));
