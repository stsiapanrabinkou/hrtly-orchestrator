import { useParams } from "@tanstack/react-router";
import { RecommendationView } from "@/shared/ui/orchestrator/RecommendationView";
import {
  patients,
  recommendations,
  type Patient,
  type Recommendation,
} from "../_mocks/orchestrator";

type Props = { items?: Patient[]; suggestions?: Recommendation[] };
export default function RecommendationScreen({
  items = patients,
  suggestions = recommendations,
}: Props) {
  const {
    id,
    view = "all",
    recommendationId,
    decision = "pending",
  } = useParams({ strict: false });
  const patient = items.find((p) => p.id === id);
  const recommendation = suggestions.find(
    (r) => r.id === recommendationId && r.patientId === id,
  );
  const initialDecision =
    decision === "accepted" ||
    decision === "modified" ||
    decision === "dismissed"
      ? decision
      : "pending";
  return (
    <RecommendationView
      key={`${id}-${recommendationId}-${decision}`}
      patient={patient ?? items[1]}
      recommendation={recommendation ?? suggestions[0]}
      returnView={view}
      initialDecision={initialDecision}
      state={patient && recommendation ? "ready" : "not-found"}
    />
  );
}
