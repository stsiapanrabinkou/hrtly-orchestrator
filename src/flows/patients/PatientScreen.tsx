import { useParams } from "@tanstack/react-router";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patients, type Patient } from "../_mocks/orchestrator";
import { patientRecords, type PatientRecord } from "../_mocks/patient-records";

type Props = { items?: Patient[]; records?: PatientRecord[] };
export default function PatientScreen({
  items = patients,
  records = patientRecords,
}: Props) {
  const { id, view = "all" } = useParams({ strict: false });
  const patient = items.find((p) => p.id === id);
  return (
    <PatientView
      key={id}
      patient={patient ?? items[1]}
      record={records.find((record) => record.patientId === id)}
      returnView={view}
      state={patient ? "ready" : "not-found"}
    />
  );
}
