import crypto from "node:crypto";
import { notifyUser } from "./sse.js";

export type Comment = {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: "citizen" | "government" | "guest";
  text: string;
  createdAt: string;
  upvotedBy: Set<string>;
};

export function serializeComment(c: Comment, viewerUserId?: string) {
  const { upvotedBy, ...rest } = c;
  return {
    ...rest,
    upvoteCount: upvotedBy.size,
    isUpvoted: viewerUserId ? upvotedBy.has(viewerUserId) : false,
  };
}

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
  notes: { text: string; at: string; by: string }[];
  timeline: { status: string; at: string; note?: string }[];
  confirmedBy: Set<string>;
  subscribers: Set<string>;
  comments: Comment[];
};

export type Citizen = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  reputation: number;
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

export const citizens = new Map<string, Citizen>();
export const citizensByEmail = new Map<string, string>(); // email -> id
export const issues = new Map<string, Issue>();
export const notifications: Notification[] = [];

export function uid(prefix = ""): string {
  return prefix + crypto.randomBytes(8).toString("hex");
}

export function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export function recomputeAuthenticity(issue: Issue): void {
  issue.authenticityScore = Math.min(100, issue.confirmations * 10);
  if (
    issue.status === "pending" &&
    issue.confirmations >= 5 &&
    issue.authenticityScore >= 50
  ) {
    issue.status = "verified";
    issue.verifiedAt = new Date().toISOString();
    issue.timeline.push({
      status: "verified",
      at: issue.verifiedAt,
      note: "Verified by community",
    });
    if (issue.reporterId) {
      pushNotification(
        issue.reporterId,
        `Your issue "${issue.title}" was verified by the community`,
        "verified",
        issue.id,
      );
    }
  }
}

export function pushNotification(
  userId: string,
  message: string,
  type?: string,
  issueId?: string,
): void {
  const notif: Notification = {
    id: uid("n_"),
    userId,
    message,
    type,
    issueId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(notif);
  notifyUser(userId, notif);
}

export function serializeIssue(
  issue: Issue,
  viewerUserId?: string,
): Omit<Issue, "confirmedBy" | "subscribers"> & {
  overdue: boolean;
  subscriberCount: number;
  isSubscribed: boolean;
} {
  const overdue =
    !!issue.deadline &&
    issue.status !== "resolved" &&
    new Date(issue.deadline).getTime() < Date.now();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmedBy: _c, subscribers: _s, ...rest } = issue;
  return {
    ...rest,
    overdue,
    subscriberCount: issue.subscribers.size,
    isSubscribed: viewerUserId ? issue.subscribers.has(viewerUserId) : false,
  };
}

export function notifySubscribers(
  issue: Issue,
  message: string,
  type: string,
  excludeUserId?: string,
): void {
  for (const userId of issue.subscribers) {
    if (userId === excludeUserId) continue;
    pushNotification(userId, message, type, issue.id);
  }
}

// ---------- seed data ----------
function seed(): void {
  if (issues.size > 0) return;

  const now = Date.now();
  const seedIssues: Partial<Issue>[] = [
    {
      title: "Massive pothole on Connaught Place ring road",
      description:
        "Deep pothole near Block A. Already caused two two-wheeler accidents this week.",
      category: "Pothole",
      address: "Block A, Connaught Place, New Delhi",
      constituency: "New Delhi",
      city: "New Delhi",
      lat: 28.6328,
      lng: 77.2197,
      urgent: true,
      anonymous: false,
      status: "verified",
      confirmations: 7,
    },
    {
      title: "Streetlight not working for 2 weeks",
      description: "Entire lane is dark after sunset, unsafe for residents.",
      category: "Streetlight",
      address: "MG Road, Indiranagar",
      constituency: "Varuna",
      city: "Mysuru",
      lat: 12.9716,
      lng: 77.6412,
      urgent: false,
      anonymous: false,
      status: "in_progress",
      confirmations: 6,
    },
    {
      title: "Water logging after every rain",
      description:
        "Knee-deep water in front of the school gate whenever it rains.",
      category: "Water Logging",
      address: "Sector 7, Karnal",
      constituency: "Karnal",
      city: "Karnal",
      lat: 29.6857,
      lng: 76.9905,
      urgent: true,
      anonymous: false,
      status: "verified",
      confirmations: 9,
    },
    {
      title: "Garbage not collected for a week",
      description: "Overflowing bins, very bad smell, attracting stray dogs.",
      category: "Garbage",
      address: "Park Street, Bhabanipur",
      constituency: "Bhabanipur",
      city: "Kolkata",
      lat: 22.5347,
      lng: 88.3569,
      urgent: false,
      anonymous: true,
      status: "pending",
      confirmations: 2,
    },
    {
      title: "Broken footpath near metro station",
      description: "Tiles uplifted, dangerous for elderly and children.",
      category: "Safety",
      address: "Hinjili Main Road",
      constituency: "Hinjili",
      city: "Bhubaneswar",
      lat: 19.7166,
      lng: 84.7374,
      urgent: false,
      anonymous: false,
      status: "resolved",
      confirmations: 8,
    },
    {
      title: "Graffiti on heritage wall",
      description:
        "Recent graffiti on the old fort wall, please clean and protect.",
      category: "Graffiti",
      address: "Old Fort Road, Gajwel",
      constituency: "Gajwel",
      city: "Hyderabad",
      lat: 17.8487,
      lng: 78.6817,
      urgent: false,
      anonymous: false,
      status: "pending",
      confirmations: 3,
    },
    {
      title: "Open manhole on busy street",
      description: "Cover missing for 4 days, urgent fix needed.",
      category: "Safety",
      address: "Sardarpura, Jodhpur",
      constituency: "Sardarpura",
      city: "Jodhpur",
      lat: 26.276,
      lng: 73.0089,
      urgent: true,
      anonymous: false,
      status: "verified",
      confirmations: 11,
    },
    {
      title: "Stagnant water breeding mosquitoes",
      description:
        "Drain blocked since last month, dengue cases rising in the area.",
      category: "Water Logging",
      address: "Patan Block",
      constituency: "Patan",
      city: "Raipur",
      lat: 21.1925,
      lng: 81.2849,
      urgent: false,
      anonymous: false,
      status: "in_progress",
      confirmations: 5,
    },
    {
      title: "Streetlight flickering near park",
      description: "Has been flickering for several nights, please replace.",
      category: "Streetlight",
      address: "Marine Drive, Mumbai",
      constituency: "Rajapur",
      city: "Mumbai",
      lat: 18.9438,
      lng: 72.8235,
      urgent: false,
      anonymous: false,
      status: "verified",
      confirmations: 6,
    },
    {
      title: "Pothole in school zone",
      description: "Right outside primary school, kids walk over it daily.",
      category: "Pothole",
      address: "Anna Salai, Chennai",
      constituency: "Kolathur",
      city: "Chennai",
      lat: 13.0827,
      lng: 80.2707,
      urgent: true,
      anonymous: false,
      status: "verified",
      confirmations: 10,
    },
    {
      title: "Garbage dump near temple",
      description: "Festival waste piling up, needs urgent clean-up.",
      category: "Garbage",
      address: "MG Road, Mysuru",
      constituency: "Varuna",
      city: "Mysuru",
      lat: 12.2958,
      lng: 76.6394,
      urgent: false,
      anonymous: false,
      status: "pending",
      confirmations: 4,
    },
    {
      title: "Open electric wires hanging low",
      description: "Live wires drooping over walkway, very dangerous.",
      category: "Safety",
      address: "Civil Lines, Gorakhpur",
      constituency: "Gorakhpur Urban",
      city: "Gorakhpur",
      lat: 26.7606,
      lng: 83.3732,
      urgent: true,
      anonymous: false,
      status: "in_progress",
      confirmations: 12,
    },
    {
      title: "Broken park bench",
      description: "Bench cracked at central park entrance.",
      category: "Other",
      address: "Park Road, Kannur",
      constituency: "Dharmadam",
      city: "Kannur",
      lat: 11.8745,
      lng: 75.3704,
      urgent: false,
      anonymous: true,
      status: "resolved",
      confirmations: 5,
    },
    {
      title: "Drain overflow on main road",
      description: "Sewage overflowing onto road for 3 days.",
      category: "Water Logging",
      address: "Sangrur Bus Stand",
      constituency: "Dhuri",
      city: "Sangrur",
      lat: 30.2458,
      lng: 75.8421,
      urgent: true,
      anonymous: false,
      status: "verified",
      confirmations: 8,
    },
    {
      title: "Faded zebra crossing near hospital",
      description: "Pedestrian crossing marks completely worn off.",
      category: "Safety",
      address: "Hospital Road, Nagpur",
      constituency: "Nagpur South West",
      city: "Nagpur",
      lat: 21.1458,
      lng: 79.0882,
      urgent: false,
      anonymous: false,
      status: "pending",
      confirmations: 3,
    },
  ];

  seedIssues.forEach((s, i) => {
    const id = uid("i_");
    const createdAt = new Date(now - (i + 1) * 1000 * 60 * 60 * 6).toISOString();
    const issue: Issue = {
      id,
      title: s.title!,
      description: s.description,
      category: s.category!,
      address: s.address!,
      constituency: s.constituency,
      city: s.city,
      state: getStateForConstituency(s.constituency),
      lat: s.lat,
      lng: s.lng,
      urgent: s.urgent ?? false,
      anonymous: s.anonymous ?? false,
      status: s.status ?? "pending",
      confirmations: s.confirmations ?? 0,
      authenticityScore: Math.min(100, (s.confirmations ?? 0) * 10),
      reporterName: s.anonymous ? undefined : "Seed Citizen",
      createdAt,
      notes: [],
      timeline: [{ status: "submitted", at: createdAt }],
      confirmedBy: new Set(),
      subscribers: new Set(),
      comments: [],
    };
    if (issue.status === "verified" || issue.status === "in_progress" || issue.status === "resolved") {
      issue.verifiedAt = new Date(
        new Date(createdAt).getTime() + 1000 * 60 * 60 * 2,
      ).toISOString();
      issue.timeline.push({ status: "verified", at: issue.verifiedAt });
    }
    if (issue.status === "in_progress") {
      issue.timeline.push({
        status: "in_progress",
        at: new Date(
          new Date(createdAt).getTime() + 1000 * 60 * 60 * 5,
        ).toISOString(),
        note: "Work order issued",
      });
      issue.deadline = new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString();
    }
    if (issue.status === "resolved") {
      issue.timeline.push({
        status: "resolved",
        at: new Date(
          new Date(createdAt).getTime() + 1000 * 60 * 60 * 24,
        ).toISOString(),
        note: "Repaired by municipal team",
      });
    }
    issues.set(id, issue);
  });
}

seed();
