/**
 * App de Express para tests (sin iniciar servidor)
 */

import express from "express";
import cors from "cors";
import mainRouter from "./src/routes/mainRouter.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", mainRouter);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
