import jwt from "jsonwebtoken";

export function createAuthMiddleware(secret) {
  return function authenticate(req, res, next) {
    const match = (req.headers.authorization || "").match(/^Bearer\s+(\S+)$/i);
    if (!match) {
      return res.status(401).json({ error: "Sign in to continue." });
    }

    try {
      req.user = jwt.verify(match[1], secret);
      return next();
    } catch {
      return res
        .status(401)
        .json({ error: "Your session expired. Sign in again." });
    }
  };
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  return next();
}
