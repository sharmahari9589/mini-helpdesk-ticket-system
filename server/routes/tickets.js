import { Router } from "express";
import { z } from "zod";

const ticketInput = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(60),
  priority: z.enum(["Low", "Medium", "High"]),
});
const statusInput = z.object({
  status: z.enum(["Open", "In Progress", "Resolved"]),
});
const ticketIdInput = z.coerce.number().int().positive();
const ticketSelect = `
  SELECT t.*, u.name AS requester, u.email AS requester_email
  FROM tickets t JOIN users u ON u.id = t.user_id
`;

export function createTicketsRouter({ db, authenticate }) {
  const router = Router();
  router.use(authenticate);

  router.get("/", (req, res) => {
    const tickets =
      req.user.role === "admin"
        ? db.prepare(`${ticketSelect} ORDER BY t.updated_at DESC`).all()
        : db
            .prepare(
              `${ticketSelect} WHERE t.user_id = ? ORDER BY t.updated_at DESC`,
            )
            .all(req.user.id);
    res.json({ tickets });
  });

  router.post("/", (req, res) => {
    const parsed = ticketInput.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { title, description, category, priority } = parsed.data;
    const result = db
      .prepare(
        "INSERT INTO tickets(user_id, title, description, category, priority) VALUES(?, ?, ?, ?, ?)",
      )
      .run(req.user.id, title, description, category, priority);
    const ticket = db
      .prepare(`${ticketSelect} WHERE t.id = ?`)
      .get(result.lastInsertRowid);
    return res.status(201).json({ ticket });
  });

  router.get("/:id", (req, res) => {
    const id = ticketIdInput.safeParse(req.params.id);
    if (!id.success)
      return res.status(404).json({ error: "Ticket not found." });

    const ticket = db.prepare(`${ticketSelect} WHERE t.id = ?`).get(id.data);
    if (
      !ticket ||
      (req.user.role !== "admin" && ticket.user_id !== req.user.id)
    ) {
      return res.status(404).json({ error: "Ticket not found." });
    }
    return res.json({ ticket });
  });

  router.patch("/:id/status", (req, res) => {
    const id = ticketIdInput.safeParse(req.params.id);
    const parsed = statusInput.safeParse(req.body);
    if (!id.success)
      return res.status(404).json({ error: "Ticket not found." });
    if (!parsed.success) {
      return res.status(400).json({ error: "Choose a valid status." });
    }

    const ticket = db
      .prepare("SELECT * FROM tickets WHERE id = ?")
      .get(id.data);
    if (
      !ticket ||
      (req.user.role !== "admin" && ticket.user_id !== req.user.id)
    ) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    db.prepare(
      "UPDATE tickets SET status = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(parsed.data.status, ticket.id);
    const updatedTicket = db
      .prepare(`${ticketSelect} WHERE t.id = ?`)
      .get(ticket.id);
    return res.json({ ticket: updatedTicket });
  });

  router.delete("/:id", (req, res) => {
    const id = ticketIdInput.safeParse(req.params.id);
    if (!id.success)
      return res.status(404).json({ error: "Ticket not found." });

    const ticket = db
      .prepare("SELECT * FROM tickets WHERE id = ?")
      .get(id.data);
    if (
      !ticket ||
      (req.user.role !== "admin" && ticket.user_id !== req.user.id)
    ) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    db.prepare("DELETE FROM tickets WHERE id = ?").run(ticket.id);
    return res.json({ message: "Ticket deleted." });
  });
  return router;
}
