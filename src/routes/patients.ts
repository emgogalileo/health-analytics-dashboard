/**
 * @module routes/patients
 * @description REST endpoints for patient and biomarker resources.
 *
 * Routes:
 *  GET  /api/patients            → list all patients
 *  GET  /api/patients/:id        → patient detail + biomarkers
 *  GET  /api/patients/:id/summary → computed health summary
 *  GET  /api/patients/:id/anomalies → biomarkers outside reference range
 */

import { Router, Request, Response } from "express";
import { patients } from "../data/patients";
import { buildHealthSummary, detectAnomalies } from "../services/healthService";
import { ApiResponse } from "../types/health";

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok<T>(res: Response, data: T, status = 200): void {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(status).json(payload);
}

function notFound(res: Response, message: string): void {
  const payload: ApiResponse<null> = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(payload);
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * GET /api/patients
 * Returns the list of patients (without biomarker arrays for conciseness).
 */
router.get("/", (_req: Request, res: Response) => {
  const summary = patients.map(({ id, name, age, gender }) => ({
    id,
    name,
    age,
    gender,
  }));
  ok(res, summary);
});

/**
 * GET /api/patients/:id
 * Returns full patient data including all biomarkers.
 */
router.get("/:id", (req: Request, res: Response) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    notFound(res, `Patient with id '${req.params.id}' not found.`);
    return;
  }
  ok(res, patient);
});

/**
 * GET /api/patients/:id/summary
 * Returns computed HealthSummary for the specified patient.
 */
router.get("/:id/summary", (req: Request, res: Response) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    notFound(res, `Patient with id '${req.params.id}' not found.`);
    return;
  }
  ok(res, buildHealthSummary(patient));
});

/**
 * GET /api/patients/:id/anomalies
 * Returns biomarkers outside their reference range with deviation percentage.
 */
router.get("/:id/anomalies", (req: Request, res: Response) => {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    notFound(res, `Patient with id '${req.params.id}' not found.`);
    return;
  }
  ok(res, detectAnomalies(patient.biomarkers));
});

export default router;
