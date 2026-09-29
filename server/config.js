import "dotenv/config";
import path from "node:path";

export function loadConfig(env = process.env) {
  const isProduction = env.NODE_ENV === "production";
  const missingValues = ["JWT_SECRET", "ADMIN_PASSWORD"].filter(
    (key) => isProduction && !env[key],
  );
  if (missingValues.length) {
    throw new Error(
      `Missing required production environment variables: ${missingValues.join(", ")}`,
    );
  }

  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return {
    isProduction,
    port,
    jwtSecret: env.JWT_SECRET || "local-development-secret-change-me",
    dbPath: path.resolve(process.cwd(), env.DB_PATH || "./helpdesk.sqlite"),
    adminEmail: (env.ADMIN_EMAIL || "admin@helpdesk.local")
      .trim()
      .toLowerCase(),
    adminPassword: env.ADMIN_PASSWORD || "Admin123!",
    clientOrigin: env.CLIENT_ORIGIN || "http://localhost:5173",
  };
}
