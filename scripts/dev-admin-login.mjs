// Local-dev helper: upserts an admin user and prints a session cookie value.
// Usage: node --env-file=.env scripts/dev-admin-login.mjs
import mysql from "mysql2/promise";
import { SignJWT } from "jose";

const openId = process.env.OWNER_OPEN_ID || "local-admin";
const appId = process.env.VITE_APP_ID || "local-dev-app";
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET is not set");

const conn = await mysql.createConnection(process.env.DATABASE_URL);
await conn.execute(
  `INSERT INTO users (openId, name, email, role, lastSignedIn)
   VALUES (?, 'Local Admin', 'admin@localhost', 'admin', NOW())
   ON DUPLICATE KEY UPDATE role = 'admin', lastSignedIn = NOW()`,
  [openId],
);
await conn.end();

const token = await new SignJWT({ openId, appId, name: "Local Admin" })
  .setProtectedHeader({ alg: "HS256", typ: "JWT" })
  .setExpirationTime(Math.floor(Date.now() / 1000) + 365 * 24 * 3600)
  .sign(new TextEncoder().encode(secret));

console.log(token);
