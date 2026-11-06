import { FlowNavigation } from "@/shared/ui/orchestrator/FlowNavigation";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { patientReturnHref } from "@/shared/ui/orchestrator/workspace-navigation";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patientTrackPreview, recordTrackPreview } from "../_mocks/workspace";
import { patients, type Patient } from "../_mocks/orchestrator";
import { patientRecords, type PatientRecord } from "../_mocks/patient-records";

type Props = { items?: Patient[]; records?: PatientRecord[] };
export default function PatientScreen({
  items = patients,
  records = patientRecords,
}: Props) {
  const { id, view = "all" } = useParams({ strict: false });
  const location = useLocation();
  const navigate = useNavigate();
  const enrolled = location.state.enrolledPatientPreviews?.find((item) => item.patient.id === id);
  const originalPatient = enrolled?.patient ?? items.find((p) => p.id === id);
  const patient = originalPatient ? patientTrackPreview(originalPatient, location.state.patientTrackPreviews?.[originalPatient.id]) : undefined;
  const sourceRecord = location.state.patientRecordPreviews?.[id ?? ""] ?? enrolled?.record ?? records.find((record) => record.patientId === id);
  const record = sourceRecord && location.state.patientTrackPreviews?.[id ?? ""] ? recordTrackPreview(sourceRecord, location.state.patientTrackPreviews[id ?? ""]) : sourceRecord;
  return (
    <FlowNavigation><PatientView
      key={`${id}-${location.hash}`}
      patient={patient ?? items[1]}
      record={record}
      returnView={view}
      initialTab={["communications", "profile", "care", "timeline", "escalations"].includes(location.hash.replace(/^#/, "")) ? location.hash.replace(/^#/, "") : "overview"}
      recommendationDecisions={location.state.recommendationDecisions}
      initialOutcomeTrack={location.state.selectedOutcomeTrack}
      careUsers={location.state.internalUserPreviews?.filter((user) => user.status === "Active" && ["Physician", "Nurse", "Ancillary care provider"].includes(user.accessRole))}
      onBackToList={() => { void navigate({ to: patientReturnHref(view), hash: `patient-${patient?.displayId}`, state: location.state }); }}
      onRecordChange={(record) => { void navigate({ to: location.pathname, hash: location.hash, replace: true, resetScroll: false, state: { ...location.state, patientRecordPreviews: { ...location.state.patientRecordPreviews, [record.patientId]: record } } }); }}
      onRecommendationOpen={(recommendationId, tab) => {
        void navigate({
          to: `/patients/${id}/from/${view}/recommendations/${recommendationId}`,
          hash: tab,
          state: { ...location.state, recommendationDecisions: location.state.recommendationDecisions },
        });
      }}
      state={patient ? "ready" : "not-found"}
    /></FlowNavigation>
  );
}
