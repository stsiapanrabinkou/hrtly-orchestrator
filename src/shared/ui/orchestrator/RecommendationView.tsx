import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  CircleCheck,
  PencilLine,
  X,
  Info,
  Clock3,
  Check,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, BlankState } from "./Clinical";
import {
  demoThomas,
  recommendations,
  type Patient,
  type Recommendation,
} from "@/flows/_mocks/orchestrator";

type Decision = "pending" | "accepted" | "modified" | "dismissed";
type Props = {
  patient?: Patient;
  recommendation?: Recommendation;
  returnView?: string;
  initialDecision?: Decision;
  appBase?: string;
  state?: "ready" | "loading" | "error" | "not-found";
  onDecisionPreview?: (decision: Decision) => void;
};
export function RecommendationView({
  patient = demoThomas,
  recommendation = recommendations[0],
  returnView = "all",
  initialDecision = "pending",
  appBase = "",
  state = "ready",
  onDecisionPreview,
}: Props) {
  const [decision, setDecision] = useState<Decision>(initialDecision);
  const [dialog, setDialog] = useState<"edit" | "dismiss" | null>(null);
  const [edited, setEdited] = useState(recommendation.modified);
  const [reason, setReason] = useState("");
  const overview = `${appBase}/patients/${patient.id}/from/${returnView}`;
  const back = `${appBase}/monitoring/${returnView}#patient-${patient.displayId}`;
  const preview = (next: Decision) => {
    setDecision(next);
    setDialog(null);
    onDecisionPreview?.(next);
  };
  const decisionLabel =
    decision === "accepted"
      ? "Accepted"
      : decision === "modified"
        ? "Modified and accepted"
        : "Dismissed";
  return (
    <Shell
      section="recommendation"
      appBase={appBase}
    >
      <a
        href={state === "ready" ? overview : back}
        className="mb-6 inline-flex min-h-8 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to {state === "ready" ? patient.name : "monitoring"}
      </a>
      {state !== "ready" ? (
        <div className="clinical-panel">
          <BlankState
            kind={state === "not-found" ? "not-found" : state}
            onReset={() => {
              window.location.href = back;
            }}
          />
        </div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
            <div>
              <Text className="section-kicker mb-2">Recommendation review</Text>
              <Heading level={1}>Review recommendation</Heading>
              <Text variant="muted" className="mt-2">
                Review the explanation before choosing a response.
              </Text>
            </div>
            <Badge
              variant="outline"
              className={`rounded-md px-3 py-1.5 ${decision === "pending" ? "bg-card" : "border-success/20 bg-success-soft text-success"}`}
            >
              {decision === "pending" ? <Clock3 /> : <CircleCheck />}
              {decision === "pending" ? "Pending review" : decisionLabel}
            </Badge>
          </div>
          <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <section className="clinical-panel overflow-hidden">
                <div className="border-b p-5 sm:p-7">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
                      <ClipboardList className="size-5" />
                    </span>
                    <Text className="section-kicker">Patient follow-up</Text>
                    <Text variant="mono" className="ml-auto">
                      {recommendation.id}
                    </Text>
                  </div>
                  <Heading level={2} as="h2">
                    {recommendation.title}
                  </Heading>
                  <Text className="mt-5 text-base leading-7">
                    {recommendation.text}
                  </Text>
                </div>
                <div className="p-5 sm:p-7">
                  <Heading level={4} as="h3">
                    Why this is being suggested
                  </Heading>
                  <Text variant="muted" className="mt-3 leading-7">
                    {recommendation.explanation}
                  </Text>
                  <div className="mt-5 rounded-lg border bg-muted/30 p-4">
                    <Text className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Referenced signal
                    </Text>
                    <Text className="font-medium">{recommendation.signal}</Text>
                    <Text variant="small" className="mt-2">
                      {recommendation.signalDate}
                    </Text>
                    <Text variant="small" className="mt-1">
                      Snapshot: Oct 19, 2026 · 12:00 UTC
                    </Text>
                  </div>
                </div>
              </section>
              {decision === "pending" ? (
                <section className="clinical-panel p-5 sm:p-7">
                  <Heading level={3} as="h2">
                    Your response
                  </Heading>
                  <Text variant="muted" className="mt-2">
                    Choose the response that fits your review.
                  </Text>
                  <div className="mt-5 flex flex-col flex-wrap gap-3 sm:flex-row">
                    <Button
                      className="min-h-11"
                      onClick={() => preview("accepted")}
                    >
                      <Check />
                      Accept recommendation
                    </Button>
                    <Button
                      className="min-h-11 bg-card"
                      variant="outline"
                      onClick={() => setDialog("edit")}
                    >
                      <PencilLine />
                      Modify and accept
                    </Button>
                    <Button
                      className="min-h-11 text-muted-foreground"
                      variant="ghost"
                      onClick={() => setDialog("dismiss")}
                    >
                      <X />
                      Dismiss
                    </Button>
                  </div>
                </section>
              ) : (
                <section
                  aria-live="polite"
                  className={`rounded-xl border p-5 sm:p-7 ${decision === "dismissed" ? "border-border bg-card" : "border-success/20 bg-success-soft"}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    {decision === "dismissed" ? (
                      <X className="size-5 text-muted-foreground" />
                    ) : (
                      <CircleCheck className="size-5 text-success" />
                    )}
                    <Heading level={3} as="h2">
                      {decisionLabel}
                    </Heading>
                  </div>
                  <Text className="leading-7">
                    {decision === "modified"
                      ? edited
                      : decision === "dismissed"
                        ? "This recommendation has been dismissed."
                        : recommendation.text}
                  </Text>
                  {decision === "dismissed" && reason ? (
                    <div className="mt-4 rounded-md bg-muted/40 p-3">
                      <Text variant="small">Reason (optional)</Text>
                      <Text className="mt-1">{reason}</Text>
                    </div>
                  ) : null}
                  <div className="mt-5 border-t border-current/10 pt-4">
                    <Text className="text-xs font-medium">
                      Dr. Sarah Lewis · Oct 19, 2026 · 12:05 UTC
                    </Text>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Button asChild className="min-h-11">
                      <a href={back}>
                        Return to monitoring
                        <ArrowRight />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-11 bg-card"
                      onClick={() => preview("pending")}
                    >
                      <RotateCcw />
                      Explore another response
                    </Button>
                  </div>
                </section>
              )}
              <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <Text variant="small" className="leading-relaxed">
                  This response does not close the patient’s alert or update the
                  care plan. The original recommendation remains visible above.
                </Text>
              </div>
            </div>
            <aside className="clinical-panel p-5 sm:p-6">
              <Text className="section-kicker mb-4">Patient context</Text>
              <Heading level={3} as="h2">
                {patient.name}
              </Heading>
              <Text variant="small" className="mt-1">
                {patient.dob} · {patient.displayId}
              </Text>
              <div className="my-4">
                <TrackBadges tracks={patient.tracks} />
              </div>
              <Flag flag={patient.flag} />
              <dl className="mt-5 space-y-4 border-t pt-5 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Last measurement
                  </dt>
                  <dd
                    className={`mt-1 font-medium ${patient.overdue ? "text-warning" : ""}`}
                  >
                    {patient.elapsed}
                  </dd>
                  <dd className="mt-1 text-xs text-muted-foreground">
                    {patient.measurementType} · {patient.lastDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Latest value
                  </dt>
                  <dd className="mt-1 font-medium">{patient.reading}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">
                    {patient.readingDate}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Data quality
                  </dt>
                  <dd className="mt-1 text-xs">{patient.outcome.quality}</dd>
                </div>
              </dl>
              <Button
                asChild
                variant="outline"
                className="mt-6 min-h-11 w-full"
              >
                <a href={overview}>
                  View patient overview
                  <ArrowRight />
                </a>
              </Button>
            </aside>
          </div>
          <Dialog
            open={dialog !== null}
            onOpenChange={(open) => {
              if (!open) setDialog(null);
            }}
          >
            <DialogContent className="max-h-[calc(100svh-var(--devbar-height)-2rem)] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {dialog === "edit"
                    ? "Modify and accept recommendation"
                    : "Dismiss recommendation"}
                </DialogTitle>
                <DialogDescription>
                  {dialog === "edit"
                    ? "Adjust the recommendation text. The original stays visible."
                    : "You may add a reason. A reason is optional and does not affect dismissal."}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  preview(dialog === "edit" ? "modified" : "dismissed");
                }}
              >
                <Label htmlFor="response-text">
                  {dialog === "edit"
                    ? "Recommendation text"
                    : "Reason (optional)"}
                </Label>
                <Textarea
                  id="response-text"
                  className="mt-2 min-h-36"
                  value={dialog === "edit" ? edited : reason}
                  onChange={(e) =>
                    dialog === "edit"
                      ? setEdited(e.target.value)
                      : setReason(e.target.value)
                  }
                  placeholder={
                    dialog === "dismiss" ? "Add context if helpful" : undefined
                  }
                />
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={dialog === "edit" && !edited.trim()}
                  >
                    {dialog === "edit"
                      ? "Show modified acceptance"
                      : "Show dismissal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Shell>
  );
}
