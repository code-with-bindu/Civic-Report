import { Router, type IRouter } from "express";
import { CreateReviewBody } from "@workspace/api-zod";
import { listReviews, createReview, uid } from "../lib/store.js";
import { requireUser } from "../lib/auth.js";

const router: IRouter = Router();

router.get("/reviews", async (_req, res) => {
  const reviews = await listReviews();
  res.json(reviews);
});

router.post("/reviews", requireUser, async (req, res) => {
  const user = req.user!;
  if (user.role === "guest") {
    res.status(403).json({ error: "guests_cannot_review" });
    return;
  }
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }
  const { rating, text } = parsed.data;
  await createReview({
    id: uid("r_"),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    rating,
    text,
    createdAt: new Date().toISOString(),
  });
  const reviews = await listReviews();
  res.status(201).json(reviews[0]);
});

export default router;
