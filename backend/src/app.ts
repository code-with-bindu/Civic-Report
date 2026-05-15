import express, { type Express } from "express";
import cors from "cors";
import pinoHttpModule from "pino-http";
import router from "./routes/index";
import { logger } from "./lib/logger";

const app: Express = express();
const pinoHttp = (pinoHttpModule as any).default || pinoHttpModule;

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use("/api", router);

export default app;
