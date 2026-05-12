/**
 * @module health
 * @description Domain types for the Health Analytics Dashboard API.
 */

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  status: "normal" | "low" | "high" | "critical";
  recordedAt: string; // ISO 8601
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  biomarkers: Biomarker[];
}

export interface HealthSummary {
  patientId: string;
  totalBiomarkers: number;
  normalCount: number;
  abnormalCount: number;
  criticalCount: number;
  overallScore: number; // 0–100
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
