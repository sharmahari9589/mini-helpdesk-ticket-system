import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../middleware/auth.js";

const filterInput = z.object({
  status: z.enum(["Open", "In Progress", "Resolved"]).optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  search: z.string().trim().max(100).optional(),
});
const ticketSelect = `
  SELECT t.*, u.name AS requester, u.email AS requester_email
  FROM tickets t JOIN users u ON u.id = t.user_id
`;

export function createAdminRouter({ db, authenticate }) {
  const router = Router();
  router.use(authenticate, requireAdmin);

  router.get("/stats", (_req, res) => {
    const totals = db
      .prepare(
        `
        SELECT COUNT(*) AS total,
          SUM(status = 'Open') AS open,
          SUM(status = 'In Progress') AS inProgress,
          SUM(status = 'Resolved') AS resolved
        FROM tickets
      `,
      )
      .get();
    const byCategory = db
      .prepare(
        "SELECT category, COUNT(*) AS count FROM tickets GROUP BY category ORDER BY count DESC LIMIT 5",
      )
      .all();
    res.json({
      stats: {
        total: totals.total || 0,
        open: totals.open || 0,
        inProgress: totals.inProgress || 0,
        resolved: totals.resolved || 0,
      },
      byCategory,
    });
  });

  router.get("/tickets", (req, res) => {
    const parsed = filterInput.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid ticket filters." });
    }

    const filters = [];
    const values = [];
    const { status, priority, search } = parsed.data;
    if (status) {
      filters.push("t.status = ?");
      values.push(status);
    }
    if (priority) {
      filters.push("t.priority = ?");
      values.push(priority);
    }
    if (search) {
      filters.push("LOWER(t.title) LIKE LOWER(?)");
      values.push(`%${search}%`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const tickets = db
      .prepare(`${ticketSelect} ${where} ORDER BY t.updated_at DESC`)
      .all(...values);
    return res.json({ tickets });
  });
  return router;
}
