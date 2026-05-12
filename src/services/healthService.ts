/**
 * @module services/healthService
 * @description Business logic for computing health analytics from patient biomarkers.
 *
 * Design principles:
 *  - Pure functions: no side effects, easy to unit-test.
 *  - Single Responsibility: each function does one thing.
 */

import { Biomarker, HealthSummary, Patient } from "../types/health";

/**
 * Computes a 0–100 health score from a list of biomarkers.
 *
 * Scoring weights (higher = more impactful):
 *  - normal   → +10 pts
 *  - low/high → -5 pts
 *  - critical → -20 pts
 */
export function computeHealthScore(biomarkers: Biomarker[]): number {
  if (biomarkers.length === 0) return 0;

  const weightMap: Record<Biomarker["status"], number> = {
    normal: 10,
    low: -5,
    high: -5,
    critical: -20,
  };

  const raw = biomarkers.reduce((sum, bm) => sum + weightMap[bm.status], 0);
  const maxPossible = biomarkers.length * 10;

  // Clamp score to [0, 100] and normalise
  const score = Math.max(0, Math.min(100, ((raw + maxPossible) / (2 * maxPossible)) * 100));
  return Math.round(score);
}

/**
 * Builds a HealthSummary for a single patient.
 */
export function buildHealthSummary(patient: Patient): HealthSummary {
  const { biomarkers } = patient;

  const normalCount = biomarkers.filter((b) => b.status === "normal").length;
  const abnormalCount = biomarkers.filter((b) => b.status === "low" || b.status === "high").length;
  const criticalCount = biomarkers.filter((b) => b.status === "critical").length;

  return {
    patientId: patient.id,
    totalBiomarkers: biomarkers.length,
    normalCount,
    abnormalCount,
    criticalCount,
    overallScore: computeHealthScore(biomarkers),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Filters biomarkers whose value falls outside the reference range and
 * annotates the deviation percentage.
 */
export function detectAnomalies(
  biomarkers: Biomarker[]
): Array<Biomarker & { deviationPct: number }> {
  return biomarkers
    .filter((bm) => bm.status !== "normal")
    .map((bm) => {
      const midpoint = (bm.referenceMin + bm.referenceMax) / 2;
      const deviationPct = midpoint !== 0 ? Math.abs((bm.value - midpoint) / midpoint) * 100 : 0;
      return { ...bm, deviationPct: Math.round(deviationPct * 10) / 10 };
    });
}
