import bcrypt from "bcryptjs";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createDatabase } from "./database.js";

const config = loadConfig();
const db = await createDatabase(config.dbPath);
const existingAdmin = db
  .prepare("SELECT id FROM users WHERE email = ?")
  .get(config.adminEmail);

if (!existingAdmin) {
  db.prepare(
    "INSERT INTO users(name, email, password_hash, role) VALUES(?, ?, ?, ?)",
  ).run(
    "Helpdesk Admin",
    config.adminEmail,
    bcrypt.hashSync(config.adminPassword, 10),
    "admin",
  );
}

const server = createApp({ db, config }).listen(config.port, () => {
  console.log(`Helpdesk API listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
