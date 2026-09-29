import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAuthMiddleware } from "./middleware/auth.js";
import { createAdminRouter } from "./routes/admin.js";
import { createAuthRouter } from "./routes/auth.js";
import { createTicketsRouter } from "./routes/tickets.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ db, config }) {
  const app = express();
  const authenticate = createAuthMiddleware(config.jwtSecret);

  app.disable("x-powered-by");
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.use(
    "/api/auth",
    createAuthRouter({ db, secret: config.jwtSecret, authenticate }),
  );
  app.use("/api/tickets", createTicketsRouter({ db, authenticate }));
  app.use("/api/admin", createAdminRouter({ db, authenticate }));
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });

  const distPath = path.resolve(currentDirectory, "../frontend/dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"), (error) => {
      if (error) res.status(404).send("Build the frontend with npm run build.");
    });
  });
  app.use((error, _req, res, _next) => {
    if (error.type === "entity.parse.failed") {
      return res
        .status(400)
        .json({ error: "Request body must be valid JSON." });
    }
    console.error(error);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  });

  return app;
}
