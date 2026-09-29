import fs from "node:fs";
import path from "node:path";
import initSqlJs from "sql.js";

const schema = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
    status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Resolved')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_tickets_user_updated
    ON tickets(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tickets_status_priority
    ON tickets(status, priority);
`;

export async function createDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const SQL = await initSqlJs();
  const rawDb = fs.existsSync(dbPath)
    ? new SQL.Database(fs.readFileSync(dbPath))
    : new SQL.Database();
  rawDb.run("PRAGMA foreign_keys = ON;");

  const persist = () => fs.writeFileSync(dbPath, Buffer.from(rawDb.export()));
  const db = {
    exec(sql) {
      rawDb.run(sql);
      persist();
    },
    prepare(sql) {
      return {
        all(...params) {
          const statement = rawDb.prepare(sql);
          try {
            statement.bind(params);
            const rows = [];
            while (statement.step()) rows.push(statement.getAsObject());
            return rows;
          } finally {
            statement.free();
          }
        },
        get(...params) {
          const statement = rawDb.prepare(sql);
          try {
            statement.bind(params);
            return statement.step() ? statement.getAsObject() : undefined;
          } finally {
            statement.free();
          }
        },
        run(...params) {
          rawDb.run(sql, params);
          const lastInsertRowid = rawDb.exec(
            "SELECT last_insert_rowid() AS id",
          )[0]?.values[0][0];
          persist();
          return { lastInsertRowid };
        },
      };
    },
    close() {
      persist();
      rawDb.close();
    },
  };

  db.exec(schema);
  return db;
}
