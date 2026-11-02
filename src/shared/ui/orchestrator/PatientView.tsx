import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  CircleDashed,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, MetricCard, BlankState } from "./Clinical";
import {
  PatientRecordPanels,
  type PatientActionPreview,
} from "./PatientRecordPanels";
import {
  patientRecords,
  type PatientRecord,
} from "@/flows/_mocks/patient-records";
import { demoThomas, type Patient } from "@/flows/_mocks/orchestrator";
import { mockClinician } from "@/flows/_mocks/clinician";

type Props = {
  patient?: Patient;
  record?: PatientRecord;
  initialTab?: string;
  tabsAppearance?: "current" | "line";
  actingUser?: string;
  referralPreviewOutcome?: "success" | "failure";
  onActionPreview?: (action: PatientActionPreview) => void;
  returnView?: string;
  appBase?: string;
  state?: "ready" | "loading" | "error" | "not-found";
};
export function PatientView({
  patient = demoThomas,
  record,
  initialTab = "overview",
  tabsAppearance = "line",
  actingUser = mockClinician.name,
  referralPreviewOutcome = "success",
  onActionPreview,
  returnView = "all",
  appBase = "",
  state = "ready",
}: Props) {
  const [tab, setTab] = useState(initialTab);
  const [details, setDetails] = useState(
    record ?? patientRecords.find((item) => item.patientId === patient.id),
  );
  const metrics = patient.metrics.filter(
    (metric) => metric.value !== "Not applicable",
  );
  const outcomes = [
    patient.outcome,
    ...(patient.additionalOutcome ? [patient.additionalOutcome] : []),
  ];
  const back = `${appBase}/monitoring/${returnView}#patient-${patient.displayId}`;
  const recHref = `${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${patient.recommendationId}`;
  const [outcomeTrack, setOutcomeTrack] = useState(patient.outcome.track);
  const o =
    outcomes.find((outcome) => outcome.track === outcomeTrack) ??
    patient.outcome;
  return (
    <Shell section="patient" appBase={appBase}>
      <a
        href={back}
        onClick={(event) => {
          if (window.history.length > 1) {
            event.preventDefault();
            window.history.back();
          }
        }}
        className="mb-6 inline-flex min-h-8 items-center gap-2 rounded-sm text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back
      </a>
      {state !== "ready" || !details ? (
        <div className="clinical-panel">
          <BlankState
            kind={state === "ready" ? "not-found" : state}
            onReset={() => {
              if (state === "error") window.location.reload();
              else window.location.href = back;
            }}
          />
        </div>
      ) : (
        <>
          <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <Heading level={1}>{patient.name}</Heading>
                </div>
                <Text variant="muted" className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>DOB {patient.dob}</span>
                  <span className="inline-flex items-center gap-3"><span aria-hidden="true" className="text-foreground">·</span>{patient.displayId}</span>
                  <span className="inline-flex items-center gap-3"><span aria-hidden="true" className="text-foreground">·</span>Clinician: {details.team.find((member) => member.role === "Physician")?.name ?? "Not assigned"}</span>
                </Text>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <TrackBadges tracks={patient.tracks} size="md" />
              <Badge
                variant="outline"
                className="h-8 rounded-full bg-card px-3 py-1 text-sm"
              >
                Risk <span className="ml-1 font-semibold">{patient.risk}</span>
              </Badge>
              <Flag flag={patient.flag} size="md" />
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={tabsAppearance === "line" ? "sticky top-[calc(var(--devbar-height)+4rem+1px)] z-10 mb-5 flex min-w-0 overflow-x-auto overflow-y-hidden border-b border-border bg-background pt-2" : "sticky top-[calc(var(--devbar-height)+4rem+1px)] z-10 mb-5 min-w-0 overflow-x-auto overflow-y-hidden border-b bg-background py-2"}>
              <TabsList
                aria-label="Patient record sections"
                variant={tabsAppearance === "line" ? "line" : "default"}
                className={tabsAppearance === "line" ? "h-9! min-w-max p-0" : "min-h-12 min-w-max gap-2 rounded-none bg-transparent p-0"}
              >
                {[
                  { value: "overview", label: "Overview" },
                  { value: "timeline", label: "Clinical timeline" },
                  { value: "care", label: "Care plan" },
                  { value: "profile", label: "Profile & enrollment" },
                  {
                    value: "escalations",
                    label: `Escalations${details.escalations.length ? ` (${details.escalations.length})` : ""}`,
                  },
                  { value: "communications", label: "Communications" },
                ].map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={tabsAppearance === "line" ? "h-9! rounded-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none focus-visible:bg-accent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:after:opacity-100 after:inset-x-0 after:-bottom-px! after:h-0.5! after:rounded-t-[2px] after:bg-foreground" : "h-12 rounded-none border-b-2 border-transparent px-3 text-muted-foreground data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"}
                  >
                    {item.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
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
                        · Informational action ·{" "}
                        {patient.overdue
                          ? "Check access to monitoring and agree on the next reading."
                          : "Review recorded signals with the assigned care team."}
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 px-0 text-primary"
                        onClick={() =>
                          setTab(
                            patient.flag === "none" ? "care" : "escalations",
                          )
                        }
                      >
                        {patient.flag === "none"
                          ? "View care plan"
                          : "View escalation log"}
                        <ArrowRight className="size-4" />
                      </Button>
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
                    Snapshot: {details.snapshot}
                  </Text>
                </div>
                <div
                  className={`grid gap-4 sm:grid-cols-2 ${metrics.length > 2 ? "xl:grid-cols-4" : ""}`}
                >
                  {metrics.map((m) => (
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
                            className="mb-3"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {outcomes.map((outcome) => (
                              <SelectItem
                                key={outcome.track}
                                value={outcome.track}
                              >
                                {outcome.track}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                      <Heading level={3} as="h2" id="outcome-title">
                        {o.measure}
                      </Heading>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-2.5 py-1 ${o.status === "Met" ? "border-success/15 bg-success-soft text-success" : o.status === "Cannot determine" ? "bg-muted text-muted-foreground" : "border-warning/15 bg-warning-soft text-warning"}`}
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
                        {details.enrollments.find(
                          (enrollment) => enrollment.track === o.track,
                        )?.elapsed ?? "Days elapsed unavailable"}
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
                      {o.baseline === "Missing / incomplete" ? (
                        <CircleDashed className="size-3.5" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
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
                <div className="space-y-5">
                  <section
                    aria-labelledby="recommendation-title"
                    className="clinical-panel p-5 sm:p-6"
                  >
                    <Text className="section-kicker mb-3">Next review</Text>
                    <Heading level={3} as="h2" id="recommendation-title">
                      {details.recommendations[0]?.title ??
                        "No recommendation pending"}
                    </Heading>
                    <Text variant="muted" className="mt-3 leading-relaxed">
                      {details.recommendations[0]?.text ??
                        "Review the care plan and recent clinical events for ongoing follow-up."}
                    </Text>
                    {patient.recommendationId ? (
                      <Button className="mt-5 w-full" asChild>
                        <a href={recHref}>
                          Review recommendation
                          <ArrowRight />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="mt-5"
                        onClick={() => setTab("care")}
                      >
                        View care plan
                        <ArrowRight />
                      </Button>
                    )}
                    {patient.recommendationId && (
                      <Text variant="small" className="mt-3">
                        A recommendation decision does not close the clinical
                        alert.
                      </Text>
                    )}
                    {details.recommendations.length > 1 && (
                      <Button
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setTab("communications")}
                      >
                        View all {details.recommendations.length}{" "}
                        recommendations
                      </Button>
                    )}
                  </section>
                  <section
                    className="clinical-panel p-5 sm:p-6"
                    aria-labelledby="care-context-title"
                  >
                    <Heading level={3} as="h2" id="care-context-title">
                      Care context
                    </Heading>
                    <dl className="mt-4 grid gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">
                          Preferred contact
                        </dt>
                        <dd className="mt-1 font-medium">
                          {details.profile.modality} ·{" "}
                          {details.profile.language}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Monitoring support
                        </dt>
                        <dd className="mt-1">
                          {details.profile.digitalLiteracy}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Transportation
                        </dt>
                        <dd className="mt-1">
                          {details.profile.transportation}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Assigned hub</dt>
                        <dd className="mt-1">{details.profile.hub}</dd>
                      </div>
                    </dl>
                    <Button
                      variant="outline"
                      className="mt-5 w-full"
                      onClick={() => setTab("communications")}
                    >
                      Patient messages
                      {details.messages.length > 0 && (
                        <Badge variant="secondary">
                          {details.messages.length}
                        </Badge>
                      )}
                      <ArrowRight className="size-4" />
                    </Button>
                  </section>
                </div>
              </div>
            </TabsContent>
            <PatientRecordPanels
              patient={patient}
              record={details}
              actingUser={actingUser}
              returnView={returnView}
              appBase={appBase}
              onActionPreview={onActionPreview}
              referralPreviewOutcome={referralPreviewOutcome}
              onRecordPreview={(update) =>
                setDetails((current) => (current ? update(current) : current))
              }
            />
          </Tabs>
        </>
      )}
    </Shell>
  );
}
