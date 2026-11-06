import { patients, type Patient } from "./orchestrator";
import { patientRecords, type PatientRecord } from "./patient-records";
import { mockCareTeamUsers } from "./clinician";

export const registryPatients = patients.map((patient, index) => ({
  patient,
  record: patientRecords[index],
  riskTier: (["High", "High", "High", "Moderate", "Low", "Moderate", "Low", "Not assessed"] as const)[index % 8],
  outcomeCategory: patient.outcome.status === "Met" ? "Met target" : patient.outcome.projection.startsWith("At risk") ? "At risk" : patient.outcome.projection.startsWith("Likely") ? "On track" : "Cannot determine",
}));
export type RegistryPatient = (typeof registryPatients)[number];
export const careTracks = ["CKM", "eCKM", "BH", "MSK"];
export const hubs = ["Brooklyn Care Hub", "Queens Care Hub", "Remote care"];
export const accessRoles = ["Technology operator", "Read-only admin", "Physician", "Nurse", "Ancillary care provider"];
export const internalUsers = mockCareTeamUsers.map((user, index) => ({ ...user, accessRole: index < 2 ? "Physician" : index < 4 ? "Nurse" : "Ancillary care provider", status: "Active" }));
export type InternalUser = (typeof internalUsers)[number];

// Cohort display fixtures use existing outcome determinations; no clinical thresholds run in the UI.
export function buildOutcomeCohortPreview(people: Patient[]) { return careTracks.map((track) => {
  const aligned = people.filter((patient) => patient.tracks.includes(track));
  const outcomes = aligned.map((patient) => [patient.outcome, ...(patient.additionalOutcomes ?? (patient.additionalOutcome ? [patient.additionalOutcome] : []))].find((outcome) => outcome.track === track));
  const met = outcomes.filter((outcome) => outcome?.status === "Met").length;
  const notMet = outcomes.filter((outcome) => outcome?.status === "Not Met").length;
  const missing = aligned.length - met - notMet;
  return { track, aligned: aligned.length, eligible: aligned.length, met, notMet, missing, rate: aligned.length ? Math.round(met / aligned.length * 100) : null };
}); }
export const outcomeCohorts = buildOutcomeCohortPreview(patients);

export function patientTrackPreview(patient: Patient, tracks = patient.tracks): Patient {
  if (tracks.join(",") === patient.tracks.join(",")) return patient;
  const existing = [patient.outcome, ...(patient.additionalOutcomes ?? (patient.additionalOutcome ? [patient.additionalOutcome] : []))];
  const outcomes = tracks.map((track) => existing.find((outcome) => outcome.track === track) ?? {
    ...patient.outcome, track, measure: patients.find((person) => person.outcome.track === track)?.outcome.measure ?? track,
    baseline: "Missing / incomplete", current: "No measurement recorded", status: "Cannot determine", quality: "Enrollment data needed for this track", projection: "Insufficient data", progress: null, progressLabel: "Baseline needed", window: "Window not established", remaining: "Start date unavailable",
  });
  return { ...patient, tracks, outcome: outcomes[0], additionalOutcome: undefined, additionalOutcomes: outcomes.slice(1) };
}

export function recordTrackPreview(record: PatientRecord, tracks: string[]): PatientRecord {
  return { ...record, enrollments: [
    ...record.enrollments.map((enrollment) => ({ ...enrollment, status: tracks.includes(enrollment.track) ? enrollment.status : "Reassigned" })),
    ...tracks.filter((track) => !record.enrollments.some((enrollment) => enrollment.track === track)).map((track) => ({ track, start: "Just now", baseline: "Missing / incomplete", status: "Active", elapsed: "0 days elapsed" })),
  ] };
}
