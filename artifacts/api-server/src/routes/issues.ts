import { Router, type IRouter } from "express";
import {
  CreateIssueBody,
  ListIssuesQueryParams,
  UpdateIssueStatusBody,
  AddIssueNoteBody,
} from "@workspace/api-zod";
import {
  issues,
  pushNotification,
  recomputeAuthenticity,
  serializeIssue,
  uid,
  getStateForConstituency,
  type Issue,
} from "../lib/store.js";
import { attachUser, requireUser } from "../lib/auth.js";

const router: IRouter = Router();

router.use(attachUser);

router.get("/", (req, res) => {
  const params = ListIssuesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "invalid_query" });
    return;
  }
  const { scope, status, category, constituency, city, state } = params.data;

  let list: Issue[] = Array.from(issues.values());

  if (scope === "mine") {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    list = list.filter((i) => i.reporterId === req.user!.id);
  } else if (scope === "community") {
    list = list.filter((i) => i.status === "pending");
    if (req.user) list = list.filter((i) => i.reporterId !== req.user!.id);
  } else if (scope === "constituency") {
    if (!req.user || req.user.role !== "government") {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    list = list.filter(
      (i) =>
        i.constituency === req.user!.constituency &&
        i.status !== "pending" &&
        i.status !== "rejected",
    );
  } else if (scope === "area") {
    // exclude rejected by default; filter by city/state happens below
    list = list.filter((i) => i.status !== "rejected");
  } else if (scope === "all") {
    list = list.filter((i) => i.status !== "rejected");
  }

  if (status) list = list.filter((i) => i.status === status);
  if (category) list = list.filter((i) => i.category === category);
  if (constituency) list = list.filter((i) => i.constituency === constituency);
  if (city) {
    const c = city.toLowerCase();
    list = list.filter((i) => (i.city ?? "").toLowerCase() === c);
  }
  if (state) {
    const s = state.toLowerCase();
    list = list.filter((i) => (i.state ?? "").toLowerCase() === s);
  }

  list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  res.json(list.map(serializeIssue));
});

router.post("/", requireUser, (req, res) => {
  const parsed = CreateIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const id = uid("i_");
  const now = new Date().toISOString();
  const data = parsed.data;
  if (data.lat === undefined || data.lng === undefined) {
    res.status(400).json({ error: "location_required" });
    return;
  }
  const issue: Issue = {
    id,
    title: data.title,
    description: data.description,
    category: data.category,
    address: data.address,
    constituency: data.constituency,
    city: data.city,
    state: data.state ?? getStateForConstituency(data.constituency),
    lat: data.lat,
    lng: data.lng,
    photoUrl: data.photoUrl,
    urgent: data.urgent ?? false,
    anonymous: data.anonymous ?? false,
    status: "pending",
    confirmations: 0,
    authenticityScore: 0,
    reporterId: req.user!.id,
    reporterName: data.anonymous ? undefined : req.user!.name,
    createdAt: now,
    notes: [],
    timeline: [{ status: "submitted", at: now }],
    confirmedBy: new Set(),
  };
  issues.set(id, issue);
  res.json(serializeIssue(issue));
});

router.get("/:id", (req, res) => {
  const issue = issues.get(req.params.id as string);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(serializeIssue(issue));
});

router.post("/:id/confirm", requireUser, (req, res) => {
  const issue = issues.get(req.params.id as string);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (issue.reporterId === req.user!.id) {
    res.status(400).json({ error: "cannot_confirm_own" });
    return;
  }
  if (issue.confirmedBy.has(req.user!.id)) {
    res.json(serializeIssue(issue));
    return;
  }
  issue.confirmedBy.add(req.user!.id);
  issue.confirmations += 1;
  recomputeAuthenticity(issue);
  res.json(serializeIssue(issue));
});

router.post("/:id/status", requireUser, (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const issue = issues.get(req.params.id as string);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (issue.constituency !== req.user!.constituency) {
    res.status(403).json({ error: "wrong_constituency" });
    return;
  }
  const parsed = UpdateIssueStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const now = new Date().toISOString();
  issue.status = parsed.data.status;
  if (parsed.data.deadline) issue.deadline = parsed.data.deadline;
  issue.timeline.push({
    status: parsed.data.status,
    at: now,
    note: parsed.data.note,
  });
  if (parsed.data.note) {
    issue.notes.push({ text: parsed.data.note, at: now, by: req.user!.name });
  }
  if (issue.reporterId) {
    pushNotification(
      issue.reporterId,
      parsed.data.status === "in_progress"
        ? `Government marked your issue "${issue.title}" In Progress`
        : `Your issue "${issue.title}" has been resolved`,
      parsed.data.status,
      issue.id,
    );
  }
  res.json(serializeIssue(issue));
});

router.post("/:id/note", requireUser, (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const issue = issues.get(req.params.id as string);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const parsed = AddIssueNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const now = new Date().toISOString();
  issue.notes.push({ text: parsed.data.note, at: now, by: req.user!.name });
  if (issue.reporterId) {
    pushNotification(
      issue.reporterId,
      `Government added a note on your issue "${issue.title}"`,
      "note",
      issue.id,
    );
  }
  res.json(serializeIssue(issue));
});

export default router;
