import { Router, type IRouter } from "express";
import { getPublicStats, getGovernmentStats } from "../lib/store.js";
import { attachUser, requireUser } from "../lib/auth.js";

const router: IRouter = Router();

router.use(attachUser);

router.get("/public", async (_req, res) => {
  const stats = await getPublicStats();
  res.json(stats);
});

router.get("/government", requireUser, async (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const { constituency, city, state } = req.query as {
    constituency?: string;
    city?: string;
    state?: string;
  };

  const stats = await getGovernmentStats({ constituency, city, state });
  res.json(stats);
});

export default router;
