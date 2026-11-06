import { FlowNavigation } from "@/shared/ui/orchestrator/FlowNavigation";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { WorkspacePreview } from "@/shared/ui/orchestrator/WorkspacePreview";
import { PatientsListView } from "@/shared/ui/orchestrator/PatientsListView";
import { RecommendationsListView } from "@/shared/ui/orchestrator/RecommendationsListView";
import { MessagesListView } from "@/shared/ui/orchestrator/MessagesListView";
import { OutcomesView } from "@/shared/ui/orchestrator/OutcomesView";
import { defaultWorkspaceFilters, type WorkspaceFilters } from "@/shared/ui/orchestrator/workspace-navigation";
import { workspaceNavigation, unavailableWorkspace, type WorkspaceItem } from "../_mocks/navigation";
import { registryPatients, patientTrackPreview, recordTrackPreview, buildOutcomeCohortPreview, type RegistryPatient } from "../_mocks/workspace";
import { recommendations } from "../_mocks/orchestrator";

type Props = { items?: WorkspaceItem[]; registry?: RegistryPatient[] };
export default function WorkspaceScreen({ items = workspaceNavigation, registry = registryPatients }: Props) {
  const { section } = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const rows: RegistryPatient[] = [
    ...registry.map((item) => ({ ...item, record: state.patientTrackPreviews?.[item.patient.id] ? recordTrackPreview(state.patientRecordPreviews?.[item.patient.id] ?? item.record, state.patientTrackPreviews[item.patient.id]) : state.patientRecordPreviews?.[item.patient.id] ?? item.record, patient: patientTrackPreview(item.patient, state.patientTrackPreviews?.[item.patient.id]) })),
    ...(state.enrolledPatientPreviews ?? []).map((item) => ({ ...item, riskTier: "Not assessed" as const, outcomeCategory: "Cannot determine" })),
  ];
  const filters = state.workspaceFilters ?? defaultWorkspaceFilters;
  const openPatient = (id: string, nextFilters: WorkspaceFilters = filters, track?: string) => {
    void navigate({ to: `/patients/${id}/from/${section}`, hash: section === "messages" ? "communications" : "overview", state: { ...state, workspaceFilters: nextFilters, selectedOutcomeTrack: track } });
  };
  if (section === "patients") return <FlowNavigation><PatientsListView key={section} items={rows} initialFilters={filters} trackPreviews={state.patientTrackPreviews} onPatientOpen={openPatient} onEnrollmentOpen={() => { void navigate({ to: "/patients/enroll", state }); }} onTrackPreview={(assignments) => { void navigate({ to: "/patients", replace: true, resetScroll: false, state: { ...state, patientTrackPreviews: assignments } }); }} /></FlowNavigation>;
  if (section === "recommendations") return <FlowNavigation><RecommendationsListView items={recommendations} people={rows.map((item) => item.patient)} decisions={state.recommendationDecisions} initialFilters={filters} onReview={(id, recommendationId, nextFilters) => { void navigate({ to: `/patients/${id}/from/recommendations/recommendations/${recommendationId}`, hash: "recommendations", state: { ...state, workspaceFilters: nextFilters } }); }} /></FlowNavigation>;
  if (section === "messages") return <FlowNavigation><MessagesListView people={rows.map((item) => item.patient)} records={rows.map((item) => item.record)} initialQuery={filters.query} initialPatientId={state.selectedConversation} onMessagePreview={(record) => { void navigate({ to: "/messages", replace: true, resetScroll: false, state: { ...state, selectedConversation: record.patientId, patientRecordPreviews: { ...state.patientRecordPreviews, [record.patientId]: record } } }); }} onPatientOpen={(id, records, query) => { void navigate({ to: `/patients/${id}/from/messages`, hash: "communications", state: { ...state, selectedConversation: id, workspaceFilters: { ...filters, query }, patientRecordPreviews: { ...state.patientRecordPreviews, [id]: records.find((record) => record.patientId === id)! } } }); }} /></FlowNavigation>;
  if (section === "outcomes") return <FlowNavigation><OutcomesView initialYear={state.programYear} initialThresholds={state.programThresholdPreviews} onThresholdPreview={(year, thresholds) => { void navigate({ to: "/outcomes", replace: true, resetScroll: false, state: { ...state, programYear: year, programThresholdPreviews: thresholds } }); }} items={rows} cohorts={buildOutcomeCohortPreview(rows.map((item) => item.patient))} initialFilters={filters} onPatientOpen={openPatient} /></FlowNavigation>;
  return <FlowNavigation><WorkspacePreview item={items.find((item) => item.id === section) ?? unavailableWorkspace} /></FlowNavigation>;
}
