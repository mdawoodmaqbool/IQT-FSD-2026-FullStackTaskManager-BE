/**
 * Test Aurora PostgreSQL connection using IAM authentication (RDS Signer).
 *
 * Prerequisites:
 * 1. Aurora cluster has "IAM database authentication" enabled
 * 2. DB user `postgres` is granted rds_iam role:
 *    GRANT rds_iam TO postgres;
 * 3. Your IAM user/role has rds-db:connect permission
 * 4. Security group allows your IP on port 5432
 * 5. AWS credentials configured locally (aws configure or env vars)
 *
 * Run: npm run db:test-aurora
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
const database = process.env.RDS_DATABASE || "postgres";
const region = process.env.AWS_REGION || "us-east-1";

async function getIamPassword() {
  const signer = new Signer({
    region,
    hostname,
    port,
    username,
  });
  return signer.getAuthToken();
}

async function main() {
  const password = await getIamPassword();

  const client = new Client({
    host: hostname,
    port,
    database,
    user: username,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const version = await client.query("SELECT version()");
    console.log("Connected successfully.");
    console.log(version.rows[0].version);

    const databases = await client.query(
      "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
    );
    console.log(
      "Databases:",
      databases.rows.map((r) => r.datname).join(", ")
    );
  } catch (error) {
    console.error("Database error:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main();
