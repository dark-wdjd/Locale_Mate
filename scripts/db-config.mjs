// Shared mysql2 connection config for the content scripts.
// Managed hosts (e.g. TiDB Cloud) require TLS; local dev does not.
// Enable TLS for any non-local host, overridable with DATABASE_SSL=true|false.
export function dbConnectionConfig() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = "";
  }
  const isLocal = ["localhost", "127.0.0.1", "::1", ""].includes(hostname);
  const useSsl =
    process.env.DATABASE_SSL === "true" ||
    (process.env.DATABASE_SSL !== "false" && !isLocal);

  return {
    uri: url,
    ssl: useSsl ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    multipleStatements: false,
  };
}
