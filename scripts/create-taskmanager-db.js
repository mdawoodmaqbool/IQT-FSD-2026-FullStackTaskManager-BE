/**
 * Create `taskmanager` database on Aurora (run once after IAM connection works).
 * Uses same IAM auth as test-aurora-iam.js — connects to `postgres` DB first.
 *
 * Run: npm run db:create-app-db
 */
import pg from "pg";
import { Signer } from "@aws-sdk/rds-signer";
import "dotenv/config";

const { Client } = pg;

const hostname =
  process.env.RDS_HOSTNAME ||
  "database-1.cluster-cmvwya8ouaz5.us-east-1.rds.amazonaws.com";
const port = Number(process.env.RDS_PORT || 5432);
const username = process.env.RDS_USERNAME || "postgres";
const region = process.env.AWS_REGION || "us-east-1";
const appDatabase = process.env.RDS_APP_DATABASE || "taskmanager";

async function main() {
  const signer = new Signer({ region, hostname, port, username });
  const password = await signer.getAuthToken();

  const client = new Client({
    host: hostname,
    port,
    database: "postgres",
    user: username,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const exists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [appDatabase]
    );

    if (exists.rowCount > 0) {
      console.log(`Database "${appDatabase}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE ${appDatabase}`);
    console.log(`Database "${appDatabase}" created.`);
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
