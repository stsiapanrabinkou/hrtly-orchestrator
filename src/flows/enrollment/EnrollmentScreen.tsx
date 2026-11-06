import { FlowNavigation } from "@/shared/ui/orchestrator/FlowNavigation";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { EnrollmentView } from "@/shared/ui/orchestrator/EnrollmentView";
import { patients, type Patient } from "../_mocks/orchestrator";
import { patientRecords, type PatientRecord } from "../_mocks/patient-records";

type Props = { people?: Patient[]; records?: PatientRecord[] };
export default function EnrollmentScreen({ people = patients, records = patientRecords }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const previews = location.state.enrolledPatientPreviews ?? [];
  return <FlowNavigation><EnrollmentView people={[...people, ...previews.map((item) => item.patient)]} records={[...records, ...previews.map((item) => item.record)]} onCancel={() => { void navigate({ to: "/patients", state: location.state }); }} onExistingOpen={(id) => { void navigate({ to: `/patients/${id}/from/patients`, state: location.state }); }} onComplete={(item, open) => { void navigate({ to: open ? `/patients/${item.patient.id}/from/patients` : "/patients", hash: open ? "profile" : "", state: { ...location.state, enrolledPatientPreviews: [...previews, item], patientRecordPreviews: { ...location.state.patientRecordPreviews, [item.patient.id]: item.record } } }); }} /></FlowNavigation>;
}
