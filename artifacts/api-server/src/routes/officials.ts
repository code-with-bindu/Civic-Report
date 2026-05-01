import { Router, type IRouter } from "express";
import { officials } from "../lib/store.js";

const router: IRouter = Router();

router.get("/officials", (_req, res) => {
  res.json(officials);
});

export default router;
