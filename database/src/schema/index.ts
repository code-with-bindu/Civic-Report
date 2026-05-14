import { pgTable, text, real, boolean, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";

export const citizensTable = pgTable("citizens", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  reputation: integer("reputation").notNull().default(0),
});

export const issuesTable = pgTable("issues", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  address: text("address").notNull(),
  constituency: text("constituency"),
  city: text("city"),
  state: text("state"),
  lat: real("lat"),
  lng: real("lng"),
  photoUrl: text("photo_url"),
  urgent: boolean("urgent").notNull().default(false),
  anonymous: boolean("anonymous").notNull().default(false),
  status: text("status").notNull().default("pending"),
  confirmations: integer("confirmations").notNull().default(0),
  authenticityScore: integer("authenticity_score").notNull().default(0),
  reporterId: text("reporter_id"),
  reporterName: text("reporter_name"),
  createdAt: text("created_at").notNull(),
  verifiedAt: text("verified_at"),
  deadline: text("deadline"),
  notes: jsonb("notes").$type<{ text: string; at: string; by: string }[]>().notNull().default([]),
  timeline: jsonb("timeline").$type<{ status: string; at: string; note?: string }[]>().notNull().default([]),
});

export const issueConfirmationsTable = pgTable(
  "issue_confirmations",
  {
    issueId: text("issue_id").notNull().references(() => issuesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.userId] })],
);

export const issueSubscribersTable = pgTable(
  "issue_subscribers",
  {
    issueId: text("issue_id").notNull().references(() => issuesTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.userId] })],
);

export const commentsTable = pgTable("comments", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issuesTable.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role").notNull(),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull(),
  upvoteCount: integer("upvote_count").notNull().default(0),
});

export const commentUpvotesTable = pgTable(
  "comment_upvotes",
  {
    commentId: text("comment_id").notNull().references(() => commentsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.commentId, t.userId] })],
);

export const notificationsTable = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  issueId: text("issue_id"),
  createdAt: text("created_at").notNull(),
  read: boolean("read").notNull().default(false),
});
