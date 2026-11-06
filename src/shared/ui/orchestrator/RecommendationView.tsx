import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Pencil, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, BlankState } from "./Clinical";
import { Detail, Panel } from "./RecordPanels";
import { patientReturnHref } from "./workspace-navigation";
import { demoThomas, recommendations, type Patient, type Recommendation } from "@/flows/_mocks/orchestrator";
import { mockClinician } from "@/flows/_mocks/clinician";
import { followPreviewLink, recommendationDecisionLabel, type RecommendationDecision, type RecommendationDecisionPreview, type RecommendationReturnTab } from "./recommendation-navigation";

type Props = {
  patient?: Patient;
  recommendation?: Recommendation;
  returnView?: string;
  returnTab?: RecommendationReturnTab;
  initialDecision?: RecommendationDecision;
  initialAction?: RecommendationDecisionPreview;
  actingUser?: string;
  appBase?: string;
  state?: "ready" | "loading" | "error" | "not-found";
  onDecisionPreview?: (decision: RecommendationDecision, action: RecommendationDecisionPreview) => void;
  onReturnToPatient?: (action?: RecommendationDecisionPreview) => void;
  onPatientOpen?: () => void;
};
export function RecommendationView({
  patient = demoThomas, recommendation = recommendations[0], returnView = "all", returnTab = "overview",
  initialDecision = "pending", initialAction, actingUser = mockClinician.name, appBase = "", state = "ready",
  onDecisionPreview, onReturnToPatient, onPatientOpen,
}: Props) {
  const [action, setAction] = useState<RecommendationDecisionPreview | undefined>(initialAction ?? (initialDecision !== "pending" ? {
    recommendationId: recommendation.id, title: recommendation.title, patientId: patient.id, decision: initialDecision,
    text: initialDecision === "modified" ? recommendation.modified : recommendation.text,
    reason: "", author: actingUser, date: "Oct 19, 2026 · 12:05 UTC",
  } : undefined));
  const [dialog, setDialog] = useState<"edit" | "dismiss" | null>(null);
  const [edited, setEdited] = useState(recommendation.text);
  const [reason, setReason] = useState("");
  const decision = action?.decision ?? "pending";
  const overview = `${appBase}/patients/${patient.id}/from/${returnView}`;
  const patientHref = returnTab === "recommendations" ? `${appBase}/recommendations` : `${overview}#${returnTab}`;
  const monitoring = `${patientReturnHref(returnView, appBase)}#patient-${patient.displayId}`;
  const returnLabel = returnTab === "recommendations" ? "Return to recommendations" : returnTab === "communications" ? "Return to communications" : "Return to patient";
  const returnToPatient = onReturnToPatient ? () => onReturnToPatient(action) : undefined;
  const decide = (next: Exclude<RecommendationDecision, "pending">) => {
    if (action || (next === "modified" && !edited.trim())) return;
    const now = new Date();
    const date = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })} · ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC`;
    const result: RecommendationDecisionPreview = {
      recommendationId: recommendation.id, title: recommendation.title, patientId: patient.id, decision: next,
      text: next === "modified" ? edited.trim() : recommendation.text,
      reason: next === "dismissed" ? reason.trim() : "", author: actingUser, date,
    };
    setAction(result);
    setDialog(null);
    onDecisionPreview?.(next, result);
    toast.success(next === "dismissed" ? "Recommendation dismissed." : "Recommendation approved.");
  };
  return (
    <Shell section="recommendation" appBase={appBase}>
      <a href={state === "ready" ? patientHref : monitoring} onClick={(event) => followPreviewLink(event, state === "ready" ? returnToPatient : undefined)} className="mb-6 inline-flex min-h-8 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" />Back to {state === "ready" ? returnTab === "recommendations" ? "recommendations" : patient.name : "workspace"}</a>
      {state !== "ready" ? (
        <div className="clinical-panel"><BlankState kind={state === "not-found" ? "not-found" : state} onReset={() => { if (state === "error") window.location.reload(); else window.location.href = monitoring; }} /></div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
            <div><Heading level={1}>Recommendation</Heading><Text variant="muted" className="mt-2">{patient.name} · {patient.displayId}</Text></div>
            <Badge variant="outline" className={decision === "accepted" || decision === "modified" ? "bg-success-soft text-success" : "bg-muted"}>{recommendationDecisionLabel(decision)}</Badge>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-5">
              <section className="clinical-panel p-5 sm:p-6">
                <Heading level={3} as="h2" className="break-words">{recommendation.title}</Heading>
                <Text className="mt-4 whitespace-pre-wrap break-words leading-relaxed">{action?.text ?? recommendation.text}</Text>
                {decision === "modified" && (
                  <Collapsible className="mt-4">
                    <CollapsibleTrigger asChild><Button variant="ghost" type="button" className="group gap-2">Original recommendation<ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" /></Button></CollapsibleTrigger>
                    <CollapsibleContent><Text variant="muted" className="mt-3 whitespace-pre-wrap break-words">{recommendation.text}</Text></CollapsibleContent>
                  </Collapsible>
                )}
                <div className="mt-6"><Heading level={4} as="h3">Why suggested</Heading><Text variant="muted" className="mt-3 break-words leading-relaxed">{recommendation.explanation}</Text></div>
                <div className="mt-5 rounded-lg bg-muted p-4"><Text variant="small">Referenced signal</Text><Text className="mt-2 font-medium break-words">{recommendation.signal}</Text><Text variant="small" className="mt-2">{recommendation.signalDate}</Text></div>
                {!action && (
                  <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row">
                    <Button onClick={() => decide("accepted")}><Check className="size-4" />Approve recommendation</Button>
                    <Button variant="outline" onClick={() => { setEdited(recommendation.text); setDialog("edit"); }}><Pencil className="size-4" />Edit & approve</Button>
                    <Button variant="ghost" onClick={() => setDialog("dismiss")}><X className="size-4" />Dismiss</Button>
                  </div>
                )}
              </section>
              {action && (
                <Panel title="Your decision">
                  <dl className="grid gap-5 sm:grid-cols-2"><Detail label="Action" value={recommendationDecisionLabel(action.decision)} /><Detail label="Recorded by" value={action.author} /><Detail label="Recorded at" value={action.date} /><Detail label="Recommendation ID" value={recommendation.id} /></dl>
                  {action.reason && <div className="mt-5"><Text variant="small">Dismissal reason</Text><Text className="mt-2 whitespace-pre-wrap break-words">{action.reason}</Text></div>}
                  <Button asChild variant="outline" className="mt-6"><a href={patientHref} onClick={(event) => followPreviewLink(event, returnToPatient)}>{returnLabel}<ArrowUpRight className="size-4" /></a></Button>
                </Panel>
              )}
            </div>
            <aside className="min-w-0">
              <Panel title="Patient context">
                <Heading level={4} as="h3">{patient.name}</Heading><Text variant="small" className="mt-2">DOB {patient.dob} · {patient.displayId}</Text>
                <div className="mt-4 flex flex-wrap items-center gap-2"><TrackBadges tracks={patient.tracks} /><Flag flag={patient.flag} /></div>
                <dl className="mt-6 grid gap-5"><Detail label="Last measurement" value={`${patient.measurementType} · ${patient.lastDate}`} /><Detail label="Latest value" value={patient.reading} /><Detail label="Measured at" value={patient.readingDate} /><Detail label="Data quality" value={patient.outcome.quality} /></dl>
                <Button asChild variant="outline" className="mt-6 w-full"><a href={`${overview}#overview`} onClick={(event) => followPreviewLink(event, onPatientOpen ?? (returnTab === "recommendations" ? undefined : returnToPatient))}>View patient<ArrowUpRight className="size-4" /></a></Button>
              </Panel>
            </aside>
          </div>
          <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null); }}>
            <DialogContent className="flex max-h-[85dvh] flex-col gap-6 overflow-hidden sm:max-w-xl">
              <DialogHeader><DialogTitle>{dialog === "edit" ? "Edit & approve recommendation" : "Dismiss recommendation"}</DialogTitle><DialogDescription>{patient.name} · {patient.displayId}</DialogDescription></DialogHeader>
              <form className="flex min-h-0 flex-col gap-6" onSubmit={(event) => { event.preventDefault(); decide(dialog === "edit" ? "modified" : "dismissed"); }}>
                <div className="-mx-1 min-h-0 space-y-2 overflow-y-auto p-1">
                  <Label htmlFor="response-text">{dialog === "edit" ? "Recommendation *" : "Reason (optional)"}</Label>
                  <Textarea id="response-text" className="min-h-36" maxLength={dialog === "edit" ? 4000 : 2000} required={dialog === "edit"} value={dialog === "edit" ? edited : reason} onChange={(event) => dialog === "edit" ? setEdited(event.target.value) : setReason(event.target.value)} />
                </div>
                <DialogFooter className="shrink-0"><Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button><Button type="submit" disabled={dialog === "edit" && !edited.trim()}>{dialog === "edit" ? "Approve recommendation" : "Dismiss recommendation"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Shell>
  );
}
