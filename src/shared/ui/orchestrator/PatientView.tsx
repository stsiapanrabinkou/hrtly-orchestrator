import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  AlertTriangle,
  ClipboardList,
  Info,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ChevronRight,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, MetricCard, BlankState } from "./Clinical";
import { demoThomas, type Patient } from "@/flows/_mocks/orchestrator";

type Props = {
  patient?: Patient;
  returnView?: string;
  appBase?: string;
  state?: "ready" | "loading" | "error" | "not-found";
};
export function PatientView({
  patient = demoThomas,
  returnView = "all",
  appBase = "",
  state = "ready",
}: Props) {
  const [context, setContext] = useState(false);
  const back = `${appBase}/monitoring/${returnView}#patient-${patient.displayId}`;
  const recHref = `${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${patient.recommendationId}`;
  const [outcomeTrack, setOutcomeTrack] = useState(patient.outcome.track);
  const o =
    outcomeTrack === "BH" && patient.additionalOutcome
      ? patient.additionalOutcome
      : patient.outcome;
  return (
    <Shell
      section="patient"
      appBase={appBase}
    >
      <a
        href={back}
        className="mb-6 inline-flex min-h-8 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to monitoring
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
          <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 rounded-xl">
                <AvatarFallback className="rounded-xl bg-accent text-xl text-primary">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <Heading level={1}>{patient.name}</Heading>
                  <TrackBadges tracks={patient.tracks} />
                </div>
                <Text variant="muted">
                  DOB {patient.dob} <span className="mx-2 text-border">/</span>{" "}
                  {patient.displayId}
                </Text>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Flag flag={patient.flag} />
              <Badge
                variant="outline"
                className="rounded-md bg-card px-3 py-1.5"
              >
                Risk{" "}
                <span className="ml-1 font-semibold">{patient.risk}</span>
              </Badge>
            </div>
          </div>
          <div className="mb-6 flex flex-wrap items-center gap-x-7 gap-y-2 rounded-lg border bg-card px-4 py-3">
            <Text variant="small" className="inline-flex items-center gap-2">
              <UserRound className="size-3.5" />
              Care team: Sarah Lewis, MD
            </Text>
            <Text variant="small" className="inline-flex items-center gap-2">
              <CalendarDays className="size-3.5" />
              Snapshot: Oct 19, 2026 · 12:00 UTC
            </Text>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-primary"
              onClick={() => setContext(true)}
            >
              Patient context
              <ChevronRight />
            </Button>
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 h-11 gap-4 rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                className="h-11 rounded-none border-b-2 text-muted-foreground border-transparent px-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                value="overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                className="h-11 rounded-none border-b-2 text-muted-foreground border-transparent px-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                value="history"
              >
                Measurement history
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              {patient.flag !== "none" || patient.overdue ? (
                <section
                  aria-label="Open alerts and monitoring gaps"
                  className={`rounded-xl border p-5 ${patient.flag === "red" ? "border-danger/20 bg-danger-soft" : "border-warning/20 bg-warning-soft"}`}
                >
                  <div className="flex items-start gap-3">
                    {patient.flag === "red" ? (
                      <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
                    ) : (
                      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Heading level={4} as="h2">
                          {patient.overdue
                            ? `No ${patient.measurementType} readings for ${patient.elapsed.replace(" ago", "")}`
                            : patient.reason}
                        </Heading>
                        <Badge
                          variant="outline"
                          className="border-current/15 bg-card/60 text-xs"
                        >
                          Read-only
                        </Badge>
                      </div>
                      <Text className="mt-2 leading-relaxed">
                        {patient.overdue
                          ? `Last ${patient.measurementType}: ${patient.lastDate}. Contact the patient to understand the gap in monitoring.`
                          : "An existing alert is open. Review the recorded signals and recommendation in the patient’s clinical context."}
                      </Text>
                      <Text variant="small" className="mt-2">
                        {patient.flag === "none"
                          ? "Monitoring gap only · No clinical alert recorded"
                          : `Open ${patient.flag} flag · ${patient.alertDate}`}{" "}
                        ·{" "}
                        {patient.flag === "none"
                          ? "Informational action"
                          : "Clinician note: review with assigned care team."}
                      </Text>
                      {patient.recommendationId ? (
                        <a
                          href={recHref}
                          className="mt-3 inline-flex min-h-8 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline"
                        >
                          Review recommendation
                          <ArrowRight className="size-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-success/15 bg-success-soft p-4">
                  <CheckCircle2 className="size-4 text-success" />
                  <Text className="text-success">
                    No open clinical alerts in this snapshot.
                  </Text>
                </div>
              )}
              <section aria-labelledby="latest-title">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <Heading level={3} as="h2" id="latest-title">
                    Latest measurements
                  </Heading>
                  <Text variant="small">
                    Each metric retains its own measurement date
                  </Text>
                </div>
                <div
                  className={`grid gap-4 sm:grid-cols-2 ${patient.metrics.length > 2 ? "xl:grid-cols-4" : ""}`}
                >
                  {patient.metrics.map((m) => (
                    <MetricCard key={m.label} metric={m} />
                  ))}
                </div>
              </section>
              <div className="grid items-start gap-5 xl:grid-cols-[1.4fr_1fr]">
                <section
                  aria-labelledby="outcome-title"
                  className="clinical-panel p-5 sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Text className="section-kicker mb-2">
                        Outcome tracker · {o.track}
                      </Text>
                      {patient.additionalOutcome ? (
                        <Select
                          value={outcomeTrack}
                          onValueChange={setOutcomeTrack}
                        >
                          <SelectTrigger
                            aria-label="Outcome care track"
                            className="mb-3 h-9"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CKM">CKM</SelectItem>
                            <SelectItem value="BH">BH</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Heading level={3} as="h2" id="outcome-title">
                        {o.measure}
                      </Heading>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2.5 py-1 ${o.status === "Met" ? "border-success/15 bg-success-soft text-success" : o.status === "Cannot determine" ? "bg-muted text-muted-foreground" : "border-warning/15 bg-warning-soft text-warning"}`}
                    >
                      {o.status === "Met" ? <CheckCircle2 /> : <CircleDashed />}
                      {o.status}
                    </Badge>
                  </div>
                  <div className="grid gap-5 rounded-lg bg-muted/40 p-4 sm:grid-cols-2">
                    <div>
                      <Text variant="small">Baseline at enrollment</Text>
                      <Text className="mt-1.5 font-semibold">{o.baseline}</Text>
                    </div>
                    <div>
                      <Text variant="small">Latest available value</Text>
                      <Text className="mt-1.5 font-semibold">{o.current}</Text>
                    </div>
                  </div>
                  <div className="my-5">
                    <Text variant="small" className="mb-2">
                      Progress toward the selected target
                    </Text>
                    {o.progress !== null ? (
                      <Progress
                        aria-label={o.progressLabel}
                        value={o.progress}
                        className="h-2"
                      />
                    ) : null}
                    <Text className="mt-2 font-medium">{o.progressLabel}</Text>
                    <Text variant="small" className="mt-2 leading-relaxed">
                      Target: {o.target}
                    </Text>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                    <Text variant="small">
                      {o.window}
                      <span className="mt-1 block">
                        {o.window === "Window not established"
                          ? "Days elapsed unavailable"
                          : "183 days elapsed"}
                      </span>
                    </Text>
                    <Text className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <Clock3 className="size-3.5" />
                      {o.remaining}
                    </Text>
                  </div>
                  <div className="mt-5 space-y-2 rounded-lg border border-dashed p-3.5">
                    <Text className="text-xs font-medium">Data quality</Text>
                    <Text
                      variant="small"
                      className="inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-3.5" />
                      {o.baseline === "Missing / incomplete"
                        ? "Baseline missing / incomplete"
                        : "Baseline available"}
                    </Text>
                    <Text variant="small" className="flex items-center gap-1.5">
                      <Info className="size-3.5" />
                      {o.quality}
                    </Text>
                  </div>
                  <div className="mt-4 rounded-lg bg-muted/50 p-3.5">
                    <Text className="text-xs font-medium">
                      Rule-based projection
                    </Text>
                    <Text className="mt-1 font-medium">{o.projection}</Text>
                    <Text variant="small" className="mt-1 leading-relaxed">
                      {o.projection.includes("Insufficient")
                        ? "A projection is unavailable until sufficient recent measurements are provided."
                        : "Projection based on recent measurements; separate from the current outcome status."}
                    </Text>
                  </div>
                </section>
                <section
                  aria-labelledby="recommendation-title"
                  className="clinical-panel overflow-hidden"
                >
                  <div className="border-b p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2 text-primary">
                      <ClipboardList className="size-4" />
                      <Text className="section-kicker text-primary">
                        Next review
                      </Text>
                    </div>
                    <Heading level={3} as="h2" id="recommendation-title">
                      {patient.recommendationId
                        ? "A recommendation to consider"
                        : "No recommendation pending"}
                    </Heading>
                    <Text variant="muted" className="mt-3 leading-relaxed">
                      {patient.recommendationId
                        ? patient.overdue
                          ? "Understand the gap in monitoring and the support this patient may need."
                          : "Review the existing alert alongside the patient’s recent measurements."
                        : "There are no pending recommendations in this patient’s snapshot. You can return to the monitoring list."}
                    </Text>
                    {patient.recommendationId ? (
                      <Button className="mt-5 min-h-11 w-full" asChild>
                        <a href={recHref}>
                          Review recommendation
                          <ArrowRight />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="mt-5">
                        <a href={back}>
                          Back to monitoring
                          <ArrowRight />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 bg-muted/30 p-5">
                    <Text className="text-xs font-medium">
                      Your decision stays separate
                    </Text>
                    <Text variant="small" className="leading-relaxed">
                      Reviewing a recommendation does not close a clinical alert
                      or automatically change the care plan.
                    </Text>
                  </div>
                </section>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <section className="clinical-panel space-y-6 p-6">
                <Heading level={3} as="h2">
                  Recorded measurement history
                </Heading>
                <Text variant="muted">
                  Historical values only. Measurements and escalation records
                  are read-only.
                </Text>
                {patient.metrics.map((m) => (
                  <div key={m.label} className="border-t pt-4">
                    <Heading level={4} as="h3">
                      {m.label}
                    </Heading>
                    <Text className="mt-2 leading-7">
                      {m.history ?? m.note}
                    </Text>
                    <Text variant="small" className="mt-2">
                      Latest record: {m.date}
                    </Text>
                  </div>
                ))}
              </section>
            </TabsContent>
          </Tabs>
          <Dialog open={context} onOpenChange={setContext}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Patient context</DialogTitle>
                <DialogDescription>
                  {patient.name} · {patient.displayId} · Read-only
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Date of birth</dt>
                  <dd className="mt-1 font-medium">{patient.dob}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Care team</dt>
                  <dd className="mt-1 font-medium">Sarah Lewis, MD</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Preferred language</dt>
                  <dd className="mt-1">English</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Hub</dt>
                  <dd className="mt-1">Not assigned</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Digital literacy</dt>
                  <dd className="mt-1">Not recorded</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    Transportation barrier
                  </dt>
                  <dd className="mt-1">Not recorded</dd>
                </div>
              </dl>
              <Button onClick={() => setContext(false)}>
                Return to overview
              </Button>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Shell>
  );
}
