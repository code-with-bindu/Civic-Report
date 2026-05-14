import { Router, type IRouter } from "express";
import {
  CreateIssueBody,
  ListIssuesQueryParams,
  UpdateIssueStatusBody,
  AddIssueNoteBody,
} from "@workspace/api-zod";
import {
  getIssue,
  listIssues,
  createIssue,
  updateIssueStatus,
  addIssueNote,
  confirmIssue,
  addSubscriber,
  removeSubscriber,
  addComment,
  getComments,
  getCommentById,
  toggleCommentUpvote,
  notifySubscribers,
  pushNotification,
  getStateForConstituency,
  uid,
  deleteIssue,
} from "../lib/store.js";
import { attachUser, requireUser } from "../lib/auth.js";

const router: IRouter = Router();

router.use(attachUser);

router.get("/", async (req, res) => {
  const params = ListIssuesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "invalid_query" });
    return;
  }
  const { scope, status, category, constituency, city, state } = params.data;

  if (scope === "mine" && !req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  if (scope === "constituency" && (!req.user || req.user.role !== "government")) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  const issues = await listIssues({
    scope,
    status,
    category,
    constituency: scope === "constituency" ? req.user!.constituency : constituency,
    city,
    state,
    viewerUserId: req.user?.id,
  });

  res.json(issues);
});

router.post("/", requireUser, async (req, res) => {
  const parsed = CreateIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const data = parsed.data;
  if (data.lat === undefined || data.lng === undefined) {
    res.status(400).json({ error: "location_required" });
    return;
  }

  const id = uid("i_");
  const now = new Date().toISOString();

  await createIssue({
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
    reporterId: req.user!.id,
    reporterName: data.anonymous ? undefined : req.user!.name,
    createdAt: now,
    notes: [],
    timeline: [{ status: "submitted", at: now }],
    subscriberId: req.user!.id,
  });

  const issue = await getIssue(id, req.user!.id);
  res.json(issue);
});

router.delete("/:id", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (issue.reporterId !== req.user!.id) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  await deleteIssue((req.params.id as string));
  res.json({ success: true });
});

router.get("/:id", async (req, res) => {
  const issue = await getIssue((req.params.id as string), req.user?.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(issue);
});

router.post("/:id/confirm", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (issue.reporterId === req.user!.id) {
    res.status(400).json({ error: "cannot_confirm_own" });
    return;
  }
  if (issue.confirmedByUser) {
    res.json(issue);
    return;
  }

  await confirmIssue((req.params.id as string), req.user!.id);
  const updated = await getIssue((req.params.id as string), req.user!.id);
  res.json(updated);
});

router.post("/:id/status", requireUser, async (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const parsed = UpdateIssueStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  await updateIssueStatus(
    (req.params.id as string),
    parsed.data.status,
    parsed.data.deadline,
    parsed.data.note,
    req.user!.name,
  );

  const statusMsg =
    parsed.data.status === "in_progress"
      ? `Issue "${issue.title}" is now In Progress`
      : parsed.data.status === "resolved"
        ? `Issue "${issue.title}" has been Resolved`
        : `Issue "${issue.title}" status changed to ${parsed.data.status}`;

  if (issue.reporterId) {
    await pushNotification(issue.reporterId, statusMsg, parsed.data.status, issue.id);
  }
  await notifySubscribers(issue.id, statusMsg, parsed.data.status, issue.reporterId);

  const updated = await getIssue((req.params.id as string), req.user!.id);
  res.json(updated);
});

router.post("/:id/note", requireUser, async (req, res) => {
  if (req.user!.role !== "government") {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const parsed = AddIssueNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  await addIssueNote((req.params.id as string), parsed.data.note, req.user!.name);

  const noteMsg = `Official update on "${issue.title}": ${parsed.data.note}`;
  if (issue.reporterId) {
    await pushNotification(issue.reporterId, noteMsg, "note", issue.id);
  }
  await notifySubscribers(issue.id, noteMsg, "note", issue.reporterId);

  const updated = await getIssue((req.params.id as string), req.user!.id);
  res.json(updated);
});

router.get("/:id/comments", async (req, res) => {
  const issue = await getIssue((req.params.id as string));
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const comments = await getComments((req.params.id as string), req.user?.id);
  res.json(comments);
});

router.post("/:id/comments", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string));
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const text = (req.body?.text ?? "").trim();
  if (!text || text.length > 1000) {
    res.status(400).json({ error: "invalid_text" });
    return;
  }

  const comment = await addComment({
    id: uid("c_"),
    issueId: (req.params.id as string),
    authorId: req.user!.id,
    authorName: req.user!.name,
    authorRole: req.user!.role as "citizen" | "government" | "guest",
    text,
    createdAt: new Date().toISOString(),
  });

  if (issue.reporterId && issue.reporterId !== req.user!.id) {
    await pushNotification(
      issue.reporterId,
      `${req.user!.name} commented on your issue "${issue.title}"`,
      "comment",
      issue.id,
    );
  }
  await notifySubscribers(
    issue.id,
    `New comment on "${issue.title}" by ${req.user!.name}`,
    "comment",
    req.user!.id,
  );

  res.json(comment);
});

router.post("/:id/comments/:commentId/upvote", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string));
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const commentRow = await getCommentById((req.params.commentId as string));
  if (!commentRow) {
    res.status(404).json({ error: "comment_not_found" });
    return;
  }
  if (commentRow.authorId === req.user!.id) {
    res.status(400).json({ error: "cannot_upvote_own" });
    return;
  }

  const result = await toggleCommentUpvote((req.params.commentId as string), req.user!.id);
  res.json({
    id: commentRow.id,
    issueId: commentRow.issueId,
    authorId: commentRow.authorId,
    authorName: commentRow.authorName,
    authorRole: commentRow.authorRole,
    text: commentRow.text,
    createdAt: commentRow.createdAt,
    upvoteCount: result.upvoteCount,
    upvotedByUser: result.isUpvoted,
  });
});

router.post("/:id/subscribe", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await addSubscriber((req.params.id as string), req.user!.id);
  const updated = await getIssue((req.params.id as string), req.user!.id);
  res.json(updated);
});

router.post("/:id/unsubscribe", requireUser, async (req, res) => {
  const issue = await getIssue((req.params.id as string), req.user!.id);
  if (!issue) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await removeSubscriber((req.params.id as string), req.user!.id);
  const updated = await getIssue((req.params.id as string), req.user!.id);
  res.json(updated);
});

export default router;
