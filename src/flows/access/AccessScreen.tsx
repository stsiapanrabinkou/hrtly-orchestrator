import { useNavigate, useParams } from "@tanstack/react-router";
import { AccessView, type AccessMode } from "@/shared/ui/orchestrator/AccessView";
type Props = { defaultMode?: AccessMode };
export default function AccessScreen({ defaultMode = "sign-in" }: Props) {
  const { mode } = useParams({ strict: false });
  const navigate = useNavigate();
  const screen: AccessMode = mode === "recover" || mode === "reset" || mode === "session-ended" || mode === "access-denied" ? mode : defaultMode;
  return <AccessView key={screen} mode={screen} onNavigate={(next) => { void navigate({ to: next === "workspace" ? "/monitoring/all" : `/access/${next}` }); }} />;
}
