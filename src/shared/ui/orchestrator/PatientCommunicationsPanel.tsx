import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/shared/ui/typography";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import type { Patient } from "@/flows/_mocks/orchestrator";
import { PatientMessagesPanel } from "./PatientMessagesPanel";
import { Empty, Panel } from "./RecordPanels";
import { followPreviewLink, recommendationDecisionLabel, type RecommendationDecisionPreview, type RecommendationReturnTab } from "./recommendation-navigation";

type Props = {
  patient: Patient;
  messages: PatientRecord["messages"];
  recommendations: PatientRecord["recommendations"];
  appBase: string;
  returnView: string;
  onMessageSend: (text: string) => boolean;
  decisions?: RecommendationDecisionPreview[];
  onRecommendationOpen?: (id: string, tab: RecommendationReturnTab) => void;
};

export function PatientCommunicationsPanel({ patient, messages, recommendations, appBase, returnView, onMessageSend, decisions = [], onRecommendationOpen }: Props) {
  return (
    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <PatientMessagesPanel patient={patient} messages={messages} onMessageSend={onMessageSend} />
      <aside className="min-w-0">
        <Panel title="Recommendations">
          {!recommendations.length ? <Empty>No pending recommendations.</Empty> : (
            <div className="divide-y">
              {recommendations.map((recommendation) => (
                <article key={recommendation.id} className="space-y-4 py-5 first:pt-0 last:pb-0">
                  <Heading level={4} as="h3" className="break-words">{recommendation.title}</Heading>
                  <Text className="break-words">{recommendation.text}</Text>
                  <div><Text className="font-medium">Why suggested</Text><Text variant="muted" className="mt-2 break-words">{recommendation.explanation}</Text></div>
                  <div className="rounded-lg bg-muted p-3">
                    <Text variant="small">Referenced signal</Text><Text className="mt-2 font-medium break-words">{recommendation.signal}</Text><Text variant="small" className="mt-2">{recommendation.signalDate}</Text>
                  </div>
                  <Button asChild variant="outline" className="w-full"><a href={`${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${recommendation.id}#communications`} onClick={(event) => followPreviewLink(event, onRecommendationOpen ? () => onRecommendationOpen(recommendation.id, "communications") : undefined)}>Review recommendation<ArrowUpRight className="size-4" /></a></Button>
                </article>
              ))}
            </div>
          )}
          {decisions.length > 0 && (
            <div className="mt-5 space-y-5">
              <Heading level={4} as="h3">Reviewed recommendations</Heading>
              {decisions.map((action) => (
                <article key={action.recommendationId} className="space-y-3">
                  <Badge variant="outline" className={action.decision === "dismissed" ? "bg-muted" : "bg-success-soft text-success"}>{recommendationDecisionLabel(action.decision)}</Badge>
                  <Text className="font-medium break-words">{action.title}</Text>
                  <Text variant="small">{action.author} · {action.date}</Text>
                  <Button asChild variant="outline" className="w-full"><a href={`${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${action.recommendationId}#communications`} onClick={(event) => followPreviewLink(event, onRecommendationOpen ? () => onRecommendationOpen(action.recommendationId, "communications") : undefined)}>View decision<ArrowUpRight className="size-4" /></a></Button>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </aside>
    </div>
  );
}
