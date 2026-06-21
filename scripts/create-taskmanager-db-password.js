import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pg;
const appDatabase = process.env.RDS_APP_DATABASE || "taskmanager";

function parseDatabaseUrl(connectionString) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "").split("?")[0],
  };
}

const adminDb = parseDatabaseUrl(
  process.env.DATABASE_URL.replace(`/${appDatabase}`, "/postgres")
);

const client = new Client({
  ...adminDb,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [appDatabase]
  );

  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE ${appDatabase}`);
    console.log(`Created database "${appDatabase}".`);
  } else {
    console.log(`Database "${appDatabase}" already exists.`);
  }

  const version = await client.query("SELECT version()");
  console.log("Connected:", version.rows[0].version);
} catch (error) {
  console.error("Error:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
