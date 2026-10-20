import { useParams } from "@tanstack/react-router";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patients, type Patient } from "../_mocks/orchestrator";

type Props = { items?: Patient[] };
export default function PatientScreen({ items = patients }: Props) {
  const { id, view = "all" } = useParams({ strict: false });
  const patient = items.find((p) => p.id === id);
  return (
    <PatientView
      key={id}
      patient={patient ?? items[1]}
      returnView={view}
      state={patient ? "ready" : "not-found"}
    />
  );
}
