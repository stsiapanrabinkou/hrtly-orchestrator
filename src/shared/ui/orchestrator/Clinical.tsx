import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  Activity,
  Inbox,
  SearchX,
  RefreshCw,
  CircleDashed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/shared/ui/typography";
import type { Patient, Metric } from "@/flows/_mocks/orchestrator";

export function Flag({ flag }: { flag: Patient["flag"] }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-md border-transparent px-2 py-1 font-medium ${flag === "red" ? "bg-danger-soft text-danger" : flag === "yellow" ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}
    >
      {flag === "none" ? (
        <CircleCheck className="size-3" />
      ) : flag === "red" ? (
        <CircleAlert className="size-3" />
      ) : (
        <AlertTriangle className="size-3" />
      )}
      {flag === "red"
        ? "Red flag"
        : flag === "yellow"
          ? "Yellow flag"
          : "No alerts"}
    </Badge>
  );
}
export function TrackBadges({ tracks }: { tracks: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tracks.map((t) => (
        <Badge
          key={t}
          variant="outline"
          className="rounded-md border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wide"
        >
          {t}
        </Badge>
      ))}
    </div>
  );
}
export function BlankState({
  kind,
  onReset,
}: {
  kind: string;
  onReset: () => void;
}) {
  const loading = kind === "loading";
  if (loading)
    return (
      <div
        aria-busy="true"
        aria-label="Loading patients"
        className="space-y-5 p-7"
      >
        <span className="sr-only">Loading patient data</span>
        {["a", "b", "c", "d", "e"].map((k) => (
          <div key={k} className="flex gap-8">
            <Skeleton className="h-12 w-2/5" />
            <Skeleton className="h-12 w-1/5" />
            <Skeleton className="h-12 flex-1" />
          </div>
        ))}
        <Button variant="outline" onClick={onReset}>
          Back to monitoring
        </Button>
      </div>
    );
  const error = kind === "error";
  const empty = kind === "empty";
  const missing = kind === "not-found";
  const Icon = error ? CircleAlert : empty ? Inbox : SearchX;
  return (
    <div
      className="flex min-h-80 flex-col items-center justify-center gap-3 px-6 py-12 text-center"
      role={error ? "alert" : "status"}
    >
      <div
        className={`mb-2 flex size-12 items-center justify-center rounded-full ${error ? "bg-danger-soft text-danger" : "bg-muted text-muted-foreground"}`}
      >
        <Icon className="size-6" />
      </div>
      <Heading level={3} as="h2">
        {error
          ? "Unable to load monitoring"
          : empty
            ? "No active patients yet"
            : missing
              ? "Record unavailable"
              : "No patients found"}
      </Heading>
      <Text variant="muted" className="max-w-sm">
        {error
          ? "Patient data could not be loaded. Try again."
          : missing
            ? "This record is unavailable. Return to monitoring to choose another patient."
            : empty
              ? "There are no active patients in this group. This does not indicate that all care needs have been met."
              : "No patients match your search or filters. Clear the conditions to return to all patients."}
      </Text>
      <Button className="mt-3" onClick={onReset}>
        {error ? <RefreshCw /> : null}
        {error
          ? "Try again"
          : empty || missing
            ? "Back to monitoring"
            : "Clear search and filters"}
      </Button>
    </div>
  );
}
export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card className="gap-0 rounded-xl p-5 shadow-none">
      <div className="flex items-center justify-between">
        <Heading level={4} as="h3">
          {metric.label}
        </Heading>
        {metric.trend ? (
          <Activity className="size-4 text-muted-foreground" />
        ) : (
          <CircleDashed className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-2">
        <Text
          as="span"
          className={`${metric.value === "No data" || metric.value === "Not applicable" ? "text-xl" : "text-3xl"} font-semibold tracking-tight tabular-nums`}
        >
          {metric.value}
        </Text>
        <Text as="span" variant="muted">
          {metric.unit}
        </Text>
      </div>
      <Text variant="small" className="mt-1">
        {metric.date}
      </Text>
      {metric.trend ? (
        <figure className="mt-3">
          <svg
            className="h-20 w-full text-primary"
            viewBox="0 0 288 82"
            role="img"
            aria-label={`${metric.label} historical trend: ${metric.history}`}
          >
            <path d="M24 72 H264" className="stroke-border" strokeWidth="1" />
            <path
              d="M24 42 H264"
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <polyline
              points={metric.trend}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <figcaption className="flex justify-between text-[10px] text-muted-foreground">
            <span>Earlier readings</span>
            <span>Latest</span>
          </figcaption>
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring">
              View historical values
            </summary>
            <Text variant="small" className="mt-2 leading-relaxed">
              {metric.history}
            </Text>
          </details>
        </figure>
      ) : (
        <div className="my-5 h-14 rounded-md bg-muted/40" aria-hidden="true" />
      )}
      <Text variant="small" className="mt-3 border-t pt-3">
        {metric.note}
      </Text>
    </Card>
  );
}
