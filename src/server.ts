/**
 * @module server
 * @description Express application entry point for the Health Analytics Dashboard API.
 *
 * Architecture:
 *  ┌─────────────┐    HTTP     ┌───────────────────┐    Business Logic
 *  │   Client    │ ──────────▶ │  Express Router   │ ──────────────────▶  Services
 *  └─────────────┘            └───────────────────┘
 *
 * Environment variables (see .env.example):
 *  PORT  – TCP port (default 3000)
 *
 * @example
 *  npm run dev    # ts-node with watch
 *  npm start      # compiled JS
 */

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import patientRoutes from "./routes/patients";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger (development-friendly, no external dep)
app.use((req: Request, _res: Response, next: NextFunction) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "health-analytics-dashboard", version: "1.0.0" });
});

app.use("/api/patients", patientRoutes);

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, error: "Internal server error." });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Health Analytics API running → http://localhost:${PORT}`);
  console.log(`    Endpoints:`);
  console.log(`      GET /api/health`);
  console.log(`      GET /api/patients`);
  console.log(`      GET /api/patients/:id`);
  console.log(`      GET /api/patients/:id/summary`);
  console.log(`      GET /api/patients/:id/anomalies`);
});

export default app;
