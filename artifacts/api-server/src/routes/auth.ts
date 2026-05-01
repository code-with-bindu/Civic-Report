import { Router, type IRouter } from "express";
import {
  RegisterCitizenBody,
  LoginCitizenBody,
  LoginGovernmentBody,
} from "@workspace/api-zod";
import {
  citizens,
  citizensByEmail,
  hashPassword,
  officials,
  uid,
} from "../lib/store.js";
import { sign, requireUser, type SessionUser } from "../lib/auth.js";

const router: IRouter = Router();

function buildResponse(user: SessionUser) {
  return { token: sign(user), user };
}

router.post("/citizen/register", (req, res) => {
  const parsed = RegisterCitizenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const { name, email, password } = parsed.data;
  if (citizensByEmail.has(email.toLowerCase())) {
    res.status(409).json({ error: "email_exists" });
    return;
  }
  const id = uid("c_");
  const citizen = {
    id,
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    reputation: 0,
  };
  citizens.set(id, citizen);
  citizensByEmail.set(citizen.email, id);
  const user: SessionUser = {
    id,
    role: "citizen",
    name,
    email: citizen.email,
    reputation: 0,
  };
  res.json(buildResponse(user));
});

router.post("/citizen/login", (req, res) => {
  const parsed = LoginCitizenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const { email, password } = parsed.data;
  const id = citizensByEmail.get(email.toLowerCase());
  const c = id ? citizens.get(id) : undefined;
  if (!c || c.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }
  const user: SessionUser = {
    id: c.id,
    role: "citizen",
    name: c.name,
    email: c.email,
    reputation: c.reputation,
  };
  res.json(buildResponse(user));
});

router.post("/citizen/guest", (_req, res) => {
  const id = uid("g_");
  const user: SessionUser = {
    id,
    role: "guest",
    name: `Guest ${id.slice(2, 6).toUpperCase()}`,
  };
  res.json(buildResponse(user));
});

router.post("/government/login", (req, res) => {
  const parsed = LoginGovernmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const { name, officialId } = parsed.data;
  const match = officials.find(
    (o) =>
      o.officialId.toLowerCase() === officialId.trim().toLowerCase() &&
      o.name.toLowerCase() === name.trim().toLowerCase(),
  );
  if (!match) {
    res.status(401).json({ error: "invalid_official_credentials" });
    return;
  }
  const user: SessionUser = {
    id: match.officialId,
    role: "government",
    name: match.name,
    constituency: match.constituency,
    officialId: match.officialId,
  };
  res.json(buildResponse(user));
});

router.get("/me", requireUser, (req, res) => {
  res.json(req.user);
});

export default router;
