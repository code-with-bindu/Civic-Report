import { Router, type IRouter } from "express";
import { issues } from "../lib/store.js";
import { attachUser, requireUser } from "../lib/auth.js";

const router: IRouter = Router();

router.use(attachUser);

router.get("/public", (_req, res) => {
  const all = Array.from(issues.values());
  res.json({
    totalReported: all.length,
    totalVerified: all.filter(
      (i) =>
        i.status === "verified" ||
        i.status === "in_progress" ||
        i.status === "resolved",
    ).length,
    totalResolved: all.filter((i) => i.status === "resolved").length,
  });
});

router.get("/government", requireUser, (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const { constituency, city, state } = req.query as {
    constituency?: string;
    city?: string;
    state?: string;
  };

  let all = Array.from(issues.values()).filter(
    (i) => i.status !== "pending" && i.status !== "rejected",
  );

  if (constituency) {
    all = all.filter((i) => i.constituency === constituency);
  } else if (city) {
    all = all.filter(
      (i) => (i.city ?? "").toLowerCase() === city.toLowerCase(),
    );
  } else if (state) {
    all = all.filter(
      (i) => (i.state ?? "").toLowerCase() === state.toLowerCase(),
    );
  }

  const totalVerified = all.length;
  const totalResolved = all.filter((i) => i.status === "resolved").length;
  const overdue = all.filter(
    (i) =>
      i.deadline &&
      i.status !== "resolved" &&
      new Date(i.deadline).getTime() < Date.now(),
  ).length;

  const catMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  for (const i of all) {
    catMap.set(i.category, (catMap.get(i.category) ?? 0) + 1);
    statusMap.set(i.status, (statusMap.get(i.status) ?? 0) + 1);
  }
  const byCategory = Array.from(catMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  const recentActivity = all
    .flatMap((i) =>
      i.timeline.map((t) => ({
        message: `${i.title} — ${t.status.replace("_", " ")}`,
        at: t.at,
        issueId: i.id,
      })),
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  res.json({
    totalVerified,
    totalResolved,
    overdue,
    byCategory,
    byStatus,
    recentActivity,
  });
});

export default router;
