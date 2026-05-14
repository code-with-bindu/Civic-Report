import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const SECRET = process.env["SESSION_SECRET"] || "dev-secret-please-change";

export type SessionUser = {
  id: string;
  role: "citizen" | "guest" | "government";
  name: string;
  email?: string;
  constituency?: string;
  officialId?: string;
  reputation?: number;
};

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function fromB64url(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function sign(user: SessionUser): string {
  const payload = b64url(JSON.stringify(user));
  const sig = b64url(
    crypto.createHmac("sha256", SECRET).update(payload).digest(),
  );
  return `${payload}.${sig}`;
}

export function verify(token: string): SessionUser | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = b64url(
    crypto.createHmac("sha256", SECRET).update(payload).digest(),
  );
  if (sig.length !== expected.length) return null;
  if (
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  )
    return null;
  try {
    return JSON.parse(fromB64url(payload).toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function attachUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const u = verify(auth.slice(7));
    if (u) req.user = u;
  }
  next();
}

export function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
