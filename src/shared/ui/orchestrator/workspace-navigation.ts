import type { Patient } from "@/flows/_mocks/orchestrator";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import type { InternalUser } from "@/flows/_mocks/workspace";

export type WorkspaceFilters = { query: string; track: string; risk: string; outcome: string; hub: string; team: string; status: string; page: number; sort: string };
export const defaultWorkspaceFilters: WorkspaceFilters = { query: "", track: "all", risk: "all", outcome: "all", hub: "all", team: "all", status: "pending", page: 1, sort: "asc" };
export type WorkspaceSection = "patients" | "recommendations" | "messages" | "outcomes";
export type EnrolledPatientPreview = { patient: Patient; record: PatientRecord };

declare module "@tanstack/history" {
  interface HistoryState {
    workspaceFilters?: WorkspaceFilters;
    patientRecordPreviews?: Record<string, PatientRecord>;
    enrolledPatientPreviews?: EnrolledPatientPreview[];
    patientTrackPreviews?: Record<string, string[]>;
    selectedOutcomeTrack?: string;
    internalUserPreviews?: InternalUser[];
    selectedConversation?: string;
    programThresholdPreviews?: Record<string, number>;
    programYear?: string;
  }
}

export function patientReturnHref(view: string, appBase = "") {
  return ["patients", "recommendations", "messages", "outcomes"].includes(view)
    ? `${appBase}/${view}` : `${appBase}/monitoring/${view}`;
}

export function downloadPreview(name: string, text: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function csvPreview(rows: (string | number)[][]) {
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
}
