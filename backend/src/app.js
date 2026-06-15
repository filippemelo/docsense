import cors from "cors";
import express from "express";
import askRouter from "./routes/ask.routes.js";
import documentRouter from "./routes/document.routes.js";
import healthRouter from "./routes/health.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/documents", documentRouter);
app.use("/api/ask", askRouter);

export default app;
