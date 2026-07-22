import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

const parsed = new URL(connectionString);
const hostname = parsed.hostname;
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);
const useSsl =
  process.env.DATABASE_SSL === "true" ||
  (process.env.DATABASE_SSL !== "false" && !isLocal);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ssl: useSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
  },
});
