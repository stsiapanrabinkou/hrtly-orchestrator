import { FlowNavigation } from "@/shared/ui/orchestrator/FlowNavigation";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
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
  const location = useLocation();
  const navigate = useNavigate();
  const {
    id,
    view = "all",
    recommendationId,
    decision = "pending",
  } = useParams({ strict: false });
  const patient = location.state.enrolledPatientPreviews?.find((item) => item.patient.id === id)?.patient ?? items.find((p) => p.id === id);
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
    <FlowNavigation><RecommendationView
      key={`${id}-${recommendationId}-${decision}`}
      patient={patient ?? items[1]}
      recommendation={recommendation ?? suggestions[0]}
      returnView={view}
      initialDecision={initialDecision}
      initialAction={recommendation ? location.state.recommendationDecisions?.[recommendation.id] : undefined}
      returnTab={location.hash.replace(/^#/, "") === "recommendations" ? "recommendations" : location.hash.replace(/^#/, "") === "communications" ? "communications" : "overview"}
      onDecisionPreview={(_decision, action) => {
        void navigate({
          to: location.pathname,
          hash: location.hash,
          replace: true,
          resetScroll: false,
          state: { ...location.state, recommendationDecisions: { ...location.state.recommendationDecisions, [action.recommendationId]: action } },
        });
      }}
      onPatientOpen={() => { void navigate({ to: `/patients/${id}/from/${view}`, hash: "overview", state: location.state }); }}
      onReturnToPatient={(action) => {
        void navigate({
          to: location.hash.replace(/^#/, "") === "recommendations" ? "/recommendations" : `/patients/${id}/from/${view}`,
          hash: location.hash.replace(/^#/, "") === "communications" ? "communications" : "overview",
          state: {
            ...location.state,
            recommendationDecisions: {
              ...location.state.recommendationDecisions,
              ...(action ? { [action.recommendationId]: action } : {}),
            },
          },
        });
      }}
      state={patient && recommendation ? "ready" : "not-found"}
    /></FlowNavigation>
  );
}
