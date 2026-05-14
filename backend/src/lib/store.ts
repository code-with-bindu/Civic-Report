import crypto from "node:crypto";
import { notifyUser } from "./sse.js";
import { db } from "@workspace/db";
import {
  citizensTable,
  issuesTable,
  issueConfirmationsTable,
  issueSubscribersTable,
  commentsTable,
  commentUpvotesTable,
  notificationsTable,
  reviewsTable,
} from "@workspace/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────────────────────

export type Comment = {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: "citizen" | "government" | "guest";
  text: string;
  createdAt: string;
  upvoteCount: number;
  upvotedByUser: boolean;
};

export type IssueNote = { text: string; at: string; by: string };
export type TimelineEntry = { status: string; at: string; note?: string };

export type Issue = {
  id: string;
  title: string;
  description?: string;
  category: string;
  address: string;
  constituency?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  urgent: boolean;
  anonymous: boolean;
  status: "pending" | "verified" | "in_progress" | "resolved" | "rejected";
  confirmations: number;
  authenticityScore: number;
  reporterId?: string;
  reporterName?: string;
  createdAt: string;
  verifiedAt?: string;
  deadline?: string;
  notes: IssueNote[];
  timeline: TimelineEntry[];
  confirmedByUser: boolean;
  subscriberCount: number;
  isSubscribed: boolean;
  overdue: boolean;
  comments: Comment[];
};

export type Citizen = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  reputation: number;
  city?: string;
  state?: string;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type?: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
};

// ── Utilities ─────────────────────────────────────────────────────────────────

export function uid(prefix = ""): string {
  return prefix + crypto.randomBytes(8).toString("hex");
}

export function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

// ── Officials (static) ────────────────────────────────────────────────────────

export const officials = [
  { name: "Arvind Kejriwal", constituency: "New Delhi", officialId: "MLA-ND-001", city: "New Delhi", state: "Delhi" },
  { name: "K. Chandrashekar Rao", constituency: "Gajwel", officialId: "MLA-GJ-002", city: "Hyderabad", state: "Telangana" },
  { name: "Suresh Prabhu", constituency: "Rajapur", officialId: "MLA-RJ-003", city: "Mumbai", state: "Maharashtra" },
  { name: "Devendra Fadnavis", constituency: "Nagpur South West", officialId: "MLA-NG-004", city: "Nagpur", state: "Maharashtra" },
  { name: "Yogi Adityanath", constituency: "Gorakhpur Urban", officialId: "MLA-GK-005", city: "Gorakhpur", state: "Uttar Pradesh" },
  { name: "Mamata Banerjee", constituency: "Bhabanipur", officialId: "MLA-BH-006", city: "Kolkata", state: "West Bengal" },
  { name: "M. K. Stalin", constituency: "Kolathur", officialId: "MLA-KL-007", city: "Chennai", state: "Tamil Nadu" },
  { name: "Pinarayi Vijayan", constituency: "Dharmadam", officialId: "MLA-DH-008", city: "Kannur", state: "Kerala" },
  { name: "Bhupesh Baghel", constituency: "Patan", officialId: "MLA-PT-009", city: "Raipur", state: "Chhattisgarh" },
  { name: "Ashok Gehlot", constituency: "Sardarpura", officialId: "MLA-SD-010", city: "Jodhpur", state: "Rajasthan" },
  { name: "Manohar Lal Khattar", constituency: "Karnal", officialId: "MLA-KR-011", city: "Karnal", state: "Haryana" },
  { name: "Bhagwant Mann", constituency: "Dhuri", officialId: "MLA-DR-012", city: "Sangrur", state: "Punjab" },
  { name: "Siddaramaiah", constituency: "Varuna", officialId: "MLA-VR-013", city: "Mysuru", state: "Karnataka" },
  { name: "Hemant Soren", constituency: "Barhait", officialId: "MLA-BR-014", city: "Sahibganj", state: "Jharkhand" },
  { name: "Naveen Patnaik", constituency: "Hinjili", officialId: "MLA-HJ-015", city: "Bhubaneswar", state: "Odisha" },
];

export function getStateForConstituency(constituency?: string): string | undefined {
  if (!constituency) return undefined;
  return officials.find((o) => o.constituency === constituency)?.state;
}

// ── Row → Issue mapper ────────────────────────────────────────────────────────

function rowToIssue(
  row: typeof issuesTable.$inferSelect,
  viewerUserId?: string,
  confirmedBySet?: Set<string>,
  subscriberSet?: Set<string>,
  comments?: Comment[],
): Issue {
  const confirmedByUser = viewerUserId ? (confirmedBySet?.has(viewerUserId) ?? false) : false;
  const isSubscribed = viewerUserId ? (subscriberSet?.has(viewerUserId) ?? false) : false;
  const subscriberCount = subscriberSet?.size ?? 0;
  const overdue =
    !!row.deadline &&
    row.status !== "resolved" &&
    new Date(row.deadline).getTime() < Date.now();

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category,
    address: row.address,
    constituency: row.constituency ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    photoUrl: row.photoUrl ?? undefined,
    urgent: row.urgent,
    anonymous: row.anonymous,
    status: row.status as Issue["status"],
    confirmations: row.confirmations,
    authenticityScore: row.authenticityScore,
    reporterId: row.reporterId ?? undefined,
    reporterName: row.reporterName ?? undefined,
    createdAt: row.createdAt,
    verifiedAt: row.verifiedAt ?? undefined,
    deadline: row.deadline ?? undefined,
    notes: (row.notes as IssueNote[]) ?? [],
    timeline: (row.timeline as TimelineEntry[]) ?? [],
    confirmedByUser,
    subscriberCount,
    isSubscribed,
    overdue,
    comments: comments ?? [],
  };
}

// ── Citizens ──────────────────────────────────────────────────────────────────

export async function getCitizenByEmail(email: string): Promise<Citizen | undefined> {
  const rows = await db.select().from(citizensTable).where(eq(citizensTable.email, email.toLowerCase())).limit(1);
  return rows[0];
}

export async function getCitizenById(id: string): Promise<Citizen | undefined> {
  const rows = await db.select().from(citizensTable).where(eq(citizensTable.id, id)).limit(1);
  return rows[0];
}

export async function createCitizen(citizen: Citizen): Promise<void> {
  await db.insert(citizensTable).values({
    id: citizen.id,
    name: citizen.name,
    email: citizen.email,
    passwordHash: citizen.passwordHash,
    reputation: citizen.reputation,
    city: citizen.city,
    state: citizen.state,
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function listReviews(): Promise<Review[]> {
  const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userRole: r.userRole,
    rating: r.rating,
    text: r.text,
    createdAt: r.createdAt,
  }));
}

export async function createReview(review: Review): Promise<void> {
  await db.insert(reviewsTable).values({
    id: review.id,
    userId: review.userId,
    userName: review.userName,
    userRole: review.userRole,
    rating: review.rating,
    text: review.text,
    createdAt: review.createdAt,
  });
}

// ── Issues ────────────────────────────────────────────────────────────────────

export type IssueFilters = {
  scope?: string;
  status?: string;
  category?: string;
  constituency?: string;
  city?: string;
  state?: string;
  viewerUserId?: string;
};

export async function listIssues(filters: IssueFilters): Promise<Issue[]> {
  const { scope, status, category, constituency, city, state, viewerUserId } = filters;

  let rows = await db.select().from(issuesTable).orderBy(desc(issuesTable.createdAt));

  // Apply scope filter
  if (scope === "mine" && viewerUserId) {
    rows = rows.filter((r) => r.reporterId === viewerUserId);
  } else if (scope === "community") {
    rows = rows.filter((r) => r.status === "pending");
    if (viewerUserId) rows = rows.filter((r) => r.reporterId !== viewerUserId);
  } else if (scope === "constituency" && viewerUserId) {
    rows = rows.filter((r) => r.status !== "pending" && r.status !== "rejected");
  } else if (scope === "area") {
    rows = rows.filter((r) => r.status !== "rejected");
  } else if (scope === "all") {
    rows = rows.filter((r) => r.status !== "rejected");
  }

  if (status) rows = rows.filter((r) => r.status === status);
  if (category) rows = rows.filter((r) => r.category === category);
  if (constituency) rows = rows.filter((r) => r.constituency === constituency);
  if (city) rows = rows.filter((r) => (r.city ?? "").toLowerCase() === city.toLowerCase());
  if (state) rows = rows.filter((r) => (r.state ?? "").toLowerCase() === state.toLowerCase());

  if (rows.length === 0) return [];

  // Bulk-load subscriber data for all issues
  const issueIds = rows.map((r) => r.id);

  const [allSubs, userConfirms] = await Promise.all([
    db.select().from(issueSubscribersTable).where(
      sql`${issueSubscribersTable.issueId} = ANY(ARRAY[${sql.join(issueIds.map(id => sql`${id}`), sql`, `)}]::text[])`
    ),
    viewerUserId
      ? db.select().from(issueConfirmationsTable).where(
          and(
            sql`${issueConfirmationsTable.issueId} = ANY(ARRAY[${sql.join(issueIds.map(id => sql`${id}`), sql`, `)}]::text[])`,
            eq(issueConfirmationsTable.userId, viewerUserId),
          )
        )
      : Promise.resolve([]),
  ]);

  const subsByIssue = new Map<string, Set<string>>();
  for (const s of allSubs) {
    if (!subsByIssue.has(s.issueId)) subsByIssue.set(s.issueId, new Set());
    subsByIssue.get(s.issueId)!.add(s.userId);
  }

  const confirmedIssueIds = new Set(userConfirms.map((c) => c.issueId));

  return rows.map((r) => {
    const subs = subsByIssue.get(r.id) ?? new Set<string>();
    const confirmedBySet = confirmedIssueIds.has(r.id)
      ? new Set([viewerUserId!])
      : new Set<string>();
    return rowToIssue(r, viewerUserId, confirmedBySet, subs);
  });
}

export async function getIssue(id: string, viewerUserId?: string): Promise<Issue | undefined> {
  const rows = await db.select().from(issuesTable).where(eq(issuesTable.id, id)).limit(1);
  if (!rows[0]) return undefined;
  const row = rows[0];

  const [subs, confirms, comments] = await Promise.all([
    db.select().from(issueSubscribersTable).where(eq(issueSubscribersTable.issueId, id)),
    db.select().from(issueConfirmationsTable).where(eq(issueConfirmationsTable.issueId, id)),
    loadComments(id, viewerUserId),
  ]);

  const subscriberSet = new Set(subs.map((s) => s.userId));
  const confirmedBySet = new Set(confirms.map((c) => c.userId));

  return rowToIssue(row, viewerUserId, confirmedBySet, subscriberSet, comments);
}

export async function createIssue(data: {
  id: string;
  title: string;
  description?: string;
  category: string;
  address: string;
  constituency?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  photoUrl?: string;
  urgent: boolean;
  anonymous: boolean;
  reporterId?: string;
  reporterName?: string;
  createdAt: string;
  notes: IssueNote[];
  timeline: TimelineEntry[];
  subscriberId?: string;
}): Promise<void> {
  await db.insert(issuesTable).values({
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    address: data.address,
    constituency: data.constituency,
    city: data.city,
    state: data.state,
    lat: data.lat,
    lng: data.lng,
    photoUrl: data.photoUrl,
    urgent: data.urgent,
    anonymous: data.anonymous,
    status: "pending",
    confirmations: 0,
    authenticityScore: 0,
    reporterId: data.reporterId,
    reporterName: data.reporterName,
    createdAt: data.createdAt,
    notes: data.notes,
    timeline: data.timeline,
  });
  if (data.subscriberId) {
    await db.insert(issueSubscribersTable).values({ issueId: data.id, userId: data.subscriberId });
  }
}

export async function updateIssueStatus(
  id: string,
  newStatus: string,
  deadline?: string,
  note?: string,
  updaterName?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const rows = await db.select().from(issuesTable).where(eq(issuesTable.id, id)).limit(1);
  if (!rows[0]) return;
  const row = rows[0];
  const timeline = [...((row.timeline as TimelineEntry[]) ?? []), { status: newStatus, at: now, note }];
  const notes = note ? [...((row.notes as IssueNote[]) ?? []), { text: note, at: now, by: updaterName ?? "official" }] : (row.notes as IssueNote[]);

  await db.update(issuesTable).set({
    status: newStatus,
    deadline: deadline ?? row.deadline,
    timeline,
    notes,
  }).where(eq(issuesTable.id, id));
}

export async function addIssueNote(id: string, text: string, by: string): Promise<void> {
  const now = new Date().toISOString();
  const rows = await db.select({ notes: issuesTable.notes }).from(issuesTable).where(eq(issuesTable.id, id)).limit(1);
  if (!rows[0]) return;
  const notes = [...((rows[0].notes as IssueNote[]) ?? []), { text, at: now, by }];
  await db.update(issuesTable).set({ notes }).where(eq(issuesTable.id, id));
}

export async function confirmIssue(issueId: string, userId: string): Promise<{ alreadyConfirmed: boolean }> {
  const existing = await db.select().from(issueConfirmationsTable)
    .where(and(eq(issueConfirmationsTable.issueId, issueId), eq(issueConfirmationsTable.userId, userId)))
    .limit(1);

  if (existing.length > 0) return { alreadyConfirmed: true };

  const insertResult = await db.insert(issueConfirmationsTable).values({ issueId, userId }).onConflictDoNothing().returning();
  if (insertResult.length === 0) return { alreadyConfirmed: true };


  // Increment confirmations and recompute authenticity
  const rows = await db.select().from(issuesTable).where(eq(issuesTable.id, issueId)).limit(1);
  if (!rows[0]) return { alreadyConfirmed: false };
  const row = rows[0];
  const newConfirmations = row.confirmations + 1;
  const newScore = Math.min(100, newConfirmations * 10);

  const updates: Partial<typeof issuesTable.$inferInsert> = {
    confirmations: newConfirmations,
    authenticityScore: newScore,
  };

  if (row.status === "pending" && newConfirmations >= 5 && newScore >= 50) {
    const verifiedAt = new Date().toISOString();
    const timeline = [...((row.timeline as TimelineEntry[]) ?? []), { status: "verified", at: verifiedAt, note: "Verified by community" }];
    updates.status = "verified";
    updates.verifiedAt = verifiedAt;
    updates.timeline = timeline;

    if (row.reporterId) {
      await pushNotification(row.reporterId, `Your issue "${row.title}" was verified by the community`, "verified", row.id);
    }
  }

  await db.update(issuesTable).set(updates).where(eq(issuesTable.id, issueId));
  return { alreadyConfirmed: false };
}

export async function addSubscriber(issueId: string, userId: string): Promise<void> {
  await db.insert(issueSubscribersTable).values({ issueId, userId }).onConflictDoNothing();
}

export async function removeSubscriber(issueId: string, userId: string): Promise<void> {
  await db.delete(issueSubscribersTable).where(
    and(eq(issueSubscribersTable.issueId, issueId), eq(issueSubscribersTable.userId, userId))
  );
}

export async function getSubscriberIds(issueId: string): Promise<string[]> {
  const rows = await db.select({ userId: issueSubscribersTable.userId })
    .from(issueSubscribersTable).where(eq(issueSubscribersTable.issueId, issueId));
  return rows.map((r) => r.userId);
}

// ── Comments ──────────────────────────────────────────────────────────────────

async function loadComments(issueId: string, viewerUserId?: string): Promise<Comment[]> {
  const rows = await db.select().from(commentsTable)
    .where(eq(commentsTable.issueId, issueId))
    .orderBy(asc(commentsTable.createdAt));

  if (rows.length === 0) return [];

  const commentIds = rows.map((r) => r.id);
  const upvotes = viewerUserId
    ? await db.select().from(commentUpvotesTable).where(
        and(
          sql`${commentUpvotesTable.commentId} = ANY(ARRAY[${sql.join(commentIds.map(id => sql`${id}`), sql`, `)}]::text[])`,
          eq(commentUpvotesTable.userId, viewerUserId),
        )
      )
    : [];

  const upvotedSet = new Set(upvotes.map((u) => u.commentId));

  const comments = rows.map((r) => ({
    id: r.id,
    issueId: r.issueId,
    authorId: r.authorId,
    authorName: r.authorName,
    authorRole: r.authorRole as "citizen" | "government" | "guest",
    text: r.text,
    createdAt: r.createdAt,
    upvoteCount: r.upvoteCount,
    upvotedByUser: upvotedSet.has(r.id),
  }));

  return comments.sort((a, b) => b.upvoteCount - a.upvoteCount || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function addComment(data: {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: "citizen" | "government" | "guest";
  text: string;
  createdAt: string;
}): Promise<Comment> {
  await db.insert(commentsTable).values({ ...data, upvoteCount: 0 });
  return { ...data, upvoteCount: 0, upvotedByUser: false };
}

export async function getComments(issueId: string, viewerUserId?: string): Promise<Comment[]> {
  return loadComments(issueId, viewerUserId);
}

export async function toggleCommentUpvote(commentId: string, userId: string): Promise<{ upvoteCount: number; isUpvoted: boolean }> {
  const existing = await db.select().from(commentUpvotesTable)
    .where(and(eq(commentUpvotesTable.commentId, commentId), eq(commentUpvotesTable.userId, userId)))
    .limit(1);

  const isNowUpvoted = existing.length === 0;
  const delta = isNowUpvoted ? 1 : -1;

  if (isNowUpvoted) {
    await db.insert(commentUpvotesTable).values({ commentId, userId });
  } else {
    await db.delete(commentUpvotesTable).where(
      and(eq(commentUpvotesTable.commentId, commentId), eq(commentUpvotesTable.userId, userId))
    );
  }

  const rows = await db.update(commentsTable)
    .set({ upvoteCount: sql`${commentsTable.upvoteCount} + ${delta}` })
    .where(eq(commentsTable.id, commentId))
    .returning({ upvoteCount: commentsTable.upvoteCount });

  return { upvoteCount: rows[0]?.upvoteCount ?? 0, isUpvoted: isNowUpvoted };
}

export async function getCommentById(commentId: string): Promise<typeof commentsTable.$inferSelect | undefined> {
  const rows = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId)).limit(1);
  return rows[0];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function pushNotification(
  userId: string,
  message: string,
  type?: string,
  issueId?: string,
): Promise<void> {
  const notif: Notification = {
    id: uid("n_"),
    userId,
    message,
    type,
    issueId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  await db.insert(notificationsTable).values(notif);
  notifyUser(userId, notif);
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  return db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt)) as Promise<Notification[]>;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await db.update(notificationsTable).set({ read: true }).where(eq(notificationsTable.userId, userId));
}

export async function notifySubscribers(
  issueId: string,
  message: string,
  type: string,
  excludeUserId?: string,
): Promise<void> {
  const subscriberIds = await getSubscriberIds(issueId);
  await Promise.all(
    subscriberIds
      .filter((uid) => uid !== excludeUserId)
      .map((uid) => pushNotification(uid, message, type, issueId)),
  );
}

// ── Stats (DB-backed) ─────────────────────────────────────────────────────────

export async function getPublicStats() {
  const rows = await db.select().from(issuesTable);
  return {
    totalReported: rows.length,
    totalVerified: rows.filter((r) => r.status === "verified" || r.status === "in_progress" || r.status === "resolved").length,
    totalResolved: rows.filter((r) => r.status === "resolved").length,
  };
}

export async function getGovernmentStats(filters: { constituency?: string; city?: string; state?: string }) {
  let rows = await db.select().from(issuesTable);
  rows = rows.filter((r) => r.status !== "pending" && r.status !== "rejected");

  const { constituency, city, state } = filters;
  if (constituency) rows = rows.filter((r) => r.constituency === constituency);
  else if (city) rows = rows.filter((r) => (r.city ?? "").toLowerCase() === city.toLowerCase());
  else if (state) rows = rows.filter((r) => (r.state ?? "").toLowerCase() === state.toLowerCase());

  const totalVerified = rows.length;
  const totalResolved = rows.filter((r) => r.status === "resolved").length;
  const overdue = rows.filter((r) => r.deadline && r.status !== "resolved" && new Date(r.deadline).getTime() < Date.now()).length;

  const catMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  for (const r of rows) {
    catMap.set(r.category, (catMap.get(r.category) ?? 0) + 1);
    statusMap.set(r.status, (statusMap.get(r.status) ?? 0) + 1);
  }

  const byCategory = Array.from(catMap.entries()).map(([category, count]) => ({ category, count }));
  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

  const recentActivity = rows
    .flatMap((r) =>
      ((r.timeline as TimelineEntry[]) ?? []).map((t) => ({
        message: `${r.title} — ${t.status.replace("_", " ")}`,
        at: t.at,
        issueId: r.id,
      }))
    )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return { totalVerified, totalResolved, overdue, byCategory, byStatus, recentActivity };
}

// ── Seed data ─────────────────────────────────────────────────────────────────

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select({ id: issuesTable.id }).from(issuesTable).limit(1);
  if (existing.length > 0) return;

  const now = Date.now();
  const seedIssues = [
    { title: "Massive pothole on Connaught Place ring road", description: "Deep pothole near Block A. Already caused two two-wheeler accidents this week.", category: "Pothole", address: "Block A, Connaught Place, New Delhi", constituency: "New Delhi", city: "New Delhi", lat: 28.6328, lng: 77.2197, urgent: true, anonymous: false, status: "verified", confirmations: 7 },
    { title: "Streetlight not working for 2 weeks", description: "Entire lane is dark after sunset, unsafe for residents.", category: "Streetlight", address: "MG Road, Indiranagar", constituency: "Varuna", city: "Mysuru", lat: 12.9716, lng: 77.6412, urgent: false, anonymous: false, status: "in_progress", confirmations: 6 },
    { title: "Water logging after every rain", description: "Knee-deep water in front of the school gate whenever it rains.", category: "Water Logging", address: "Sector 7, Karnal", constituency: "Karnal", city: "Karnal", lat: 29.6857, lng: 76.9905, urgent: true, anonymous: false, status: "verified", confirmations: 9 },
    { title: "Garbage not collected for a week", description: "Overflowing bins, very bad smell, attracting stray dogs.", category: "Garbage", address: "Park Street, Bhabanipur", constituency: "Bhabanipur", city: "Kolkata", lat: 22.5347, lng: 88.3569, urgent: false, anonymous: true, status: "pending", confirmations: 2 },
    { title: "Broken footpath near metro station", description: "Tiles uplifted, dangerous for elderly and children.", category: "Safety", address: "Hinjili Main Road", constituency: "Hinjili", city: "Bhubaneswar", lat: 19.7166, lng: 84.7374, urgent: false, anonymous: false, status: "resolved", confirmations: 8 },
    { title: "Graffiti on heritage wall", description: "Recent graffiti on the old fort wall, please clean and protect.", category: "Graffiti", address: "Old Fort Road, Gajwel", constituency: "Gajwel", city: "Hyderabad", lat: 17.8487, lng: 78.6817, urgent: false, anonymous: false, status: "pending", confirmations: 3 },
    { title: "Open manhole on busy street", description: "Cover missing for 4 days, urgent fix needed.", category: "Safety", address: "Sardarpura, Jodhpur", constituency: "Sardarpura", city: "Jodhpur", lat: 26.276, lng: 73.0089, urgent: true, anonymous: false, status: "verified", confirmations: 11 },
    { title: "Stagnant water breeding mosquitoes", description: "Drain blocked since last month, dengue cases rising in the area.", category: "Water Logging", address: "Patan Block", constituency: "Patan", city: "Raipur", lat: 21.1925, lng: 81.2849, urgent: false, anonymous: false, status: "in_progress", confirmations: 5 },
    { title: "Streetlight flickering near park", description: "Has been flickering for several nights, please replace.", category: "Streetlight", address: "Marine Drive, Mumbai", constituency: "Rajapur", city: "Mumbai", lat: 18.9438, lng: 72.8235, urgent: false, anonymous: false, status: "verified", confirmations: 6 },
    { title: "Pothole in school zone", description: "Right outside primary school, kids walk over it daily.", category: "Pothole", address: "Anna Salai, Chennai", constituency: "Kolathur", city: "Chennai", lat: 13.0827, lng: 80.2707, urgent: true, anonymous: false, status: "verified", confirmations: 10 },
    { title: "Garbage dump near temple", description: "Festival waste piling up, needs urgent clean-up.", category: "Garbage", address: "MG Road, Mysuru", constituency: "Varuna", city: "Mysuru", lat: 12.2958, lng: 76.6394, urgent: false, anonymous: false, status: "pending", confirmations: 4 },
    { title: "Open electric wires hanging low", description: "Live wires drooping over walkway, very dangerous.", category: "Safety", address: "Civil Lines, Gorakhpur", constituency: "Gorakhpur Urban", city: "Gorakhpur", lat: 26.7606, lng: 83.3732, urgent: true, anonymous: false, status: "in_progress", confirmations: 12 },
    { title: "Broken park bench", description: "Bench cracked at central park entrance.", category: "Other", address: "Park Road, Kannur", constituency: "Dharmadam", city: "Kannur", lat: 11.8745, lng: 75.3704, urgent: false, anonymous: true, status: "resolved", confirmations: 5 },
    { title: "Drain overflow on main road", description: "Sewage overflowing onto road for 3 days.", category: "Water Logging", address: "Sangrur Bus Stand", constituency: "Dhuri", city: "Sangrur", lat: 30.2458, lng: 75.8421, urgent: true, anonymous: false, status: "verified", confirmations: 8 },
    { title: "Faded zebra crossing near hospital", description: "Pedestrian crossing marks completely worn off.", category: "Safety", address: "Hospital Road, Nagpur", constituency: "Nagpur South West", city: "Nagpur", lat: 21.1458, lng: 79.0882, urgent: false, anonymous: false, status: "pending", confirmations: 3 },
  ] as const;

  for (let i = 0; i < seedIssues.length; i++) {
    const s = seedIssues[i];
    const id = uid("i_");
    const createdAt = new Date(now - (i + 1) * 1000 * 60 * 60 * 6).toISOString();
    const timeline: TimelineEntry[] = [{ status: "submitted", at: createdAt }];
    let verifiedAt: string | undefined;
    let deadline: string | undefined;

    if (s.status === "verified" || s.status === "in_progress" || s.status === "resolved") {
      verifiedAt = new Date(new Date(createdAt).getTime() + 1000 * 60 * 60 * 2).toISOString();
      timeline.push({ status: "verified", at: verifiedAt });
    }
    if (s.status === "in_progress") {
      timeline.push({ status: "in_progress", at: new Date(new Date(createdAt).getTime() + 1000 * 60 * 60 * 5).toISOString(), note: "Work order issued" });
      deadline = new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString();
    }
    if (s.status === "resolved") {
      timeline.push({ status: "resolved", at: new Date(new Date(createdAt).getTime() + 1000 * 60 * 60 * 24).toISOString(), note: "Repaired by municipal team" });
    }

    await db.insert(issuesTable).values({
      id,
      title: s.title,
      description: s.description,
      category: s.category,
      address: s.address,
      constituency: s.constituency,
      city: s.city,
      state: getStateForConstituency(s.constituency),
      lat: s.lat,
      lng: s.lng,
      urgent: s.urgent,
      anonymous: s.anonymous,
      status: s.status,
      confirmations: s.confirmations,
      authenticityScore: Math.min(100, s.confirmations * 10),
      reporterName: s.anonymous ? undefined : "Seed Citizen",
      createdAt,
      verifiedAt,
      deadline,
      notes: [],
      timeline,
    });
  }
}

export async function deleteIssue(id: string): Promise<void> {
  await db.delete(issuesTable).where(eq(issuesTable.id, id));
}
