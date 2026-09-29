import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
});
const userView = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export function createAuthRouter({ db, secret, authenticate }) {
  const router = Router();

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
      }

      const { name, email, password } = parsed.data;
      try {
        const result = db
          .prepare(
            "INSERT INTO users(name, email, password_hash) VALUES(?, ?, ?)",
          )
          .run(name, email.toLowerCase(), await bcrypt.hash(password, 10));
        const user = db
          .prepare("SELECT * FROM users WHERE id = ?")
          .get(result.lastInsertRowid);
        const safeUser = userView(user);
        return res.status(201).json({
          token: jwt.sign(safeUser, secret, { expiresIn: "7d" }),
          user: safeUser,
        });
      } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
          return res
            .status(409)
            .json({ error: "An account with this email already exists." });
        }
        throw error;
      }
    }),
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json({ error: "Enter a valid email and password." });
      }

      const user = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(parsed.data.email.toLowerCase());
      if (
        !user ||
        !(await bcrypt.compare(parsed.data.password, user.password_hash))
      ) {
        return res
          .status(401)
          .json({ error: "Email or password is incorrect." });
      }

      const safeUser = userView(user);
      return res.json({
        token: jwt.sign(safeUser, secret, { expiresIn: "7d" }),
        user: safeUser,
      });
    }),
  );

  router.get("/me", authenticate, (req, res) => {
    res.json({ user: req.user });
  });
  router.post("/logout", authenticate, (_req, res) => {
    res.json({ message: "Signed out." });
  });
  return router;
}
