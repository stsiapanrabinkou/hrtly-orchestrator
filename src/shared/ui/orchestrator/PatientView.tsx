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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import { Flag, TrackBadges, MetricCard, BlankState, statusBadgeClassName } from "./Clinical";
import {
  PatientRecordPanels,
  type PatientActionPreview,
} from "./PatientRecordPanels";
import {
  patientRecords,
  type PatientRecord,
} from "@/flows/_mocks/patient-records";
import { demoThomas, type Patient } from "@/flows/_mocks/orchestrator";
import { mockClinician, type CareTeamUser } from "@/flows/_mocks/clinician";
import { followPreviewLink, type RecommendationDecisions, type RecommendationReturnTab } from "./recommendation-navigation";
import { patientReturnHref } from "./workspace-navigation";
import { Empty } from "./RecordPanels";

type Props = {
  patient?: Patient;
  record?: PatientRecord;
  initialTab?: string;
  tabsAppearance?: "current" | "line";
  actingUser?: string;
  referralPreviewOutcome?: "success" | "failure";
  messagePreviewOutcome?: "success" | "failure";
  onActionPreview?: (action: PatientActionPreview) => void;
  recommendationDecisions?: RecommendationDecisions;
  onRecommendationOpen?: (id: string, tab: RecommendationReturnTab) => void;
  onBackToList?: () => void;
  onRecordChange?: (record: PatientRecord) => void;
  initialOutcomeTrack?: string;
  careUsers?: CareTeamUser[];
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
  messagePreviewOutcome = "success",
  onActionPreview,
  recommendationDecisions = {},
  onRecommendationOpen,
  onBackToList,
  onRecordChange,
  initialOutcomeTrack,
  careUsers,
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
    ...(patient.additionalOutcomes ?? (patient.additionalOutcome ? [patient.additionalOutcome] : [])),
  ];
  const back = `${patientReturnHref(returnView, appBase)}#patient-${patient.displayId}`;
  const pendingRecommendations = details?.recommendations.filter((item) => !recommendationDecisions[item.id]) ?? [];
  const recHref = `${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${pendingRecommendations[0]?.id}#overview`;
  const [outcomeTrack, setOutcomeTrack] = useState(initialOutcomeTrack ?? patient.outcome.track);
  const o =
    outcomes.find((outcome) => outcome.track === outcomeTrack) ??
    patient.outcome;
  return (
    <Shell section="patient" appBase={appBase}>
      <a
        href={back}
        onClick={(event) => followPreviewLink(event, onBackToList)}
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
                className="h-8 rounded-full border border-border bg-card px-3 py-1 text-sm"
              >
                Risk <span className="ml-1 font-semibold">{patient.risk}</span>
              </Badge>
              <Flag flag={patient.flag} size="md" />
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className={tabsAppearance === "line" ? "sticky top-[calc(var(--devbar-height)+4rem+1px)] z-10 mb-5 flex min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-border bg-background pt-2" : "sticky top-[calc(var(--devbar-height)+4rem+1px)] z-10 mb-5 min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b bg-background py-2"}>
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
                      </div>
                      {patient.overdue && (
                        <Text variant="small" className="mt-2">
                          Last reading: {metrics.find(metric => metric.label === patient.measurementType || (patient.measurementType === "BP" && metric.label === "Blood pressure") || (patient.measurementType === "Pain" && metric.label === "Pain score"))?.date ?? patient.lastDate}
                        </Text>
                      )}
                      <Text className="mt-3 leading-relaxed">
                        {patient.overdue
                          ? "Contact the patient to check for monitoring difficulties and agree on the next reading."
                          : "Review recorded signals with the assigned care team."}
                      </Text>
                      <Button
                        variant="outline"
                        className="mt-4 h-10 px-4"
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
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <Heading level={3} as="h2" id="latest-title">
                    Latest measurements
                  </Heading>
                  <Text variant="small">
                    Snapshot: {details.snapshot}
                  </Text>
                </div>
                <div
                  className="grid gap-4 lg:grid-cols-2"
                >
                  {!metrics.length && <div className="lg:col-span-2"><Empty>No measurements recorded.</Empty></div>}
                  {metrics.map((m) => (
                    <MetricCard key={m.label} metric={m} patientName={patient.name} patientId={patient.displayId} asOf={details.snapshotTimestamp} />
                  ))}
                </div>
              </section>
              <div className="clinical-panel grid overflow-hidden xl:grid-cols-[1.4fr_1fr]">
                <section
                  aria-labelledby="outcome-title"
                  className="min-w-0 p-5 sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Heading level={3} as="h2" id="outcome-title">
                        Outcome tracker
                      </Heading>
                      {outcomes.length > 1 ? (
                        <Select
                          value={outcomeTrack}
                          onValueChange={setOutcomeTrack}
                        >
                          <SelectTrigger
                            aria-label="Outcome care track"
                            className="mt-3"
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
                      <Heading level={4} as="h3" className="mt-2">
                        {o.measure}
                      </Heading>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${statusBadgeClassName} ${o.status === "Met" ? "bg-success-soft text-success" : o.status === "Cannot determine" ? "bg-muted text-muted-foreground" : "bg-warning-soft text-warning"}`}
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
                    <Text className="mb-2 font-medium">{o.progressLabel}</Text>
                    {o.progress !== null ? (
                      <Progress
                        aria-label={o.progressLabel}
                        value={o.progress}
                        className="h-2"
                      />
                    ) : null}
                    <Text variant="small" className="mt-2 leading-relaxed">
                      Target: {o.target}
                    </Text>
                  </div>
                  <div className="flex flex-wrap items-start justify-between gap-2 border-t pt-4">
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
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="min-w-0 space-y-2 rounded-lg border border-dashed p-3.5">
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
                    <Alert
                      role="group"
                      aria-label="Outcome projection"
                      className={`min-w-0 content-start rounded-xl p-3.5 ${o.projection.startsWith("Likely") ? "border-success/20 bg-success-soft text-success" : o.projection.startsWith("At risk") ? "border-warning/20 bg-warning-soft text-warning" : "border-border bg-muted/50 text-muted-foreground"}`}
                    >
                      {o.projection.startsWith("Likely") ? (
                        <CheckCircle2 aria-hidden="true" />
                      ) : o.projection.startsWith("At risk") ? (
                        <AlertTriangle aria-hidden="true" />
                      ) : (
                        <Info aria-hidden="true" />
                      )}
                      <AlertTitle>
                        <Text className="text-xs font-medium">Outcome projection</Text>
                        <Text className="mt-1 font-medium">{o.projection}</Text>
                      </AlertTitle>
                      <AlertDescription className="mt-1 text-current">
                        {o.projection.includes("Insufficient")
                          ? "A projection is unavailable until sufficient recent measurements are provided."
                          : "Projection based on recent measurements; separate from the current outcome status."}
                      </AlertDescription>
                    </Alert>
                  </div>
                </section>
                <div className="flex min-w-0 flex-col divide-y divide-border border-t border-border xl:border-t-0 xl:border-l">
                  <section
                    aria-labelledby="recommendation-title"
                    className="flex flex-1 flex-col p-5 sm:p-6"
                  >
                    <Heading level={3} as="h2" id="recommendation-title">Recommendations</Heading>
                    <Heading level={4} as="h3" className="mt-3">
                      {pendingRecommendations[0]?.title ??
                        "No recommendation pending"}
                    </Heading>
                    <Text variant="muted" className="mt-3 leading-relaxed">
                      {pendingRecommendations[0]?.text ??
                        "Review the care plan and recent clinical events for ongoing follow-up."}
                    </Text>
                    <div className="mt-auto pt-5">
                    {pendingRecommendations[0] ? (
                      <Button className="w-full" asChild>
                        <a href={recHref} onClick={(event) => followPreviewLink(event, onRecommendationOpen ? () => onRecommendationOpen(pendingRecommendations[0].id, "overview") : undefined)}>
                          Review recommendation
                          <ArrowRight />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setTab("care")}
                      >
                        View care plan
                        <ArrowRight />
                      </Button>
                    )}
                    {pendingRecommendations.length > 1 && (
                      <Button
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setTab("communications")}
                      >
                        View all {pendingRecommendations.length}{" "}
                        recommendations
                      </Button>
                    )}
                    </div>
                  </section>
                  <section
                    className="shrink-0 p-5 sm:p-6"
                    aria-labelledby="care-context-title"
                  >
                    <Heading level={3} as="h2" id="care-context-title">
                      Patient context
                    </Heading>
                    <dl className="mt-4 grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
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
                        <dd className="mt-1 font-medium">
                          {details.profile.digitalLiteracy}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Transportation
                        </dt>
                        <dd className="mt-1 font-medium">
                          {details.profile.transportation}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Assigned hub</dt>
                        <dd className="mt-1 font-medium">{details.profile.hub}</dd>
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
              record={{ ...details, recommendations: pendingRecommendations }}
              careUsers={careUsers}
              recommendationDecisions={Object.values(recommendationDecisions).filter((action) => action.patientId === patient.id)}
              onRecommendationOpen={onRecommendationOpen}
              onCarePlanOpen={() => setTab("care")}
              actingUser={actingUser}
              returnView={returnView}
              appBase={appBase}
              onActionPreview={onActionPreview}
              referralPreviewOutcome={referralPreviewOutcome}
              messagePreviewOutcome={messagePreviewOutcome}
              onRecordPreview={(update) => {
                const next = update(details);
                setDetails(next);
                onRecordChange?.(next);
              }}
            />
          </Tabs>
        </>
      )}
    </Shell>
  );
}
