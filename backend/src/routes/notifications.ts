import { Router, type IRouter } from "express";
import { getNotifications, markAllNotificationsRead } from "../lib/store.js";
import { requireUser, verify } from "../lib/auth.js";
import { addSseClient, removeSseClient } from "../lib/sse.js";

const router: IRouter = Router();

router.get("/", requireUser, async (req, res) => {
  const list = await getNotifications(req.user!.id);
  res.json(list);
});

router.post("/read-all", requireUser, async (req, res) => {
  await markAllNotificationsRead(req.user!.id);
  res.json({ ok: true });
});

router.get("/stream", (req, res) => {
  const token = req.query["token"] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const user = verify(token);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`: connected\n\n`);

  const keepAlive = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(keepAlive);
    }
  }, 25000);

  addSseClient(user.id, res);

  req.on("close", () => {
    clearInterval(keepAlive);
    removeSseClient(user.id, res);
  });
});

export default router;
