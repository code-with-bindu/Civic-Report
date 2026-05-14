import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import officialsRouter from "./officials.js";
import issuesRouter from "./issues.js";
import notificationsRouter from "./notifications.js";
import statsRouter from "./stats.js";
import { attachUser } from "../lib/auth.js";

const router: IRouter = Router();

router.use(attachUser);
router.use(healthRouter);
router.use("/auth", authRouter);
router.use(officialsRouter);
router.use("/issues", issuesRouter);
router.use("/notifications", notificationsRouter);
router.use("/stats", statsRouter);

export default router;
