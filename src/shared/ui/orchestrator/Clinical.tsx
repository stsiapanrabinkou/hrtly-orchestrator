import {
  AlertTriangle,
  CircleAlert,
  CircleCheck,
  Inbox,
  SearchX,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/shared/ui/typography";
import type { Patient } from "@/flows/_mocks/orchestrator";

export const statusBadgeClassName = "rounded-full px-2 py-1 font-medium [&>svg]:size-3!";

export function Flag({ flag, size = "sm" }: { flag: Patient["flag"]; size?: "sm" | "md" }) {
  return (
    <Badge
      variant="outline"
      className={`${statusBadgeClassName} font-medium ${size === "md" ? `h-8 gap-1.5 border px-3 py-1 text-sm [&>svg]:size-3.5! ${flag === "red" ? "border-danger/20" : flag === "yellow" ? "border-warning/20" : "border-success/20"}` : "px-2 py-1"} ${flag === "red" ? "bg-danger-soft text-danger" : flag === "yellow" ? "bg-warning-soft text-warning" : "bg-success-soft text-success"}`}
    >
      {flag === "none" ? (
        <CircleCheck className="size-3" />
      ) : flag === "red" ? (
        <CircleAlert className="size-3" />
      ) : (
        <AlertTriangle className="size-3" />
      )}
      {flag === "red"
        ? "Critical"
        : flag === "yellow"
          ? "Warning"
          : "No alerts"}
    </Badge>
  );
}
export function TrackBadges({ tracks, size = "sm" }: { tracks: string[]; size?: "sm" | "md" }) {
  return (
    <div className={`flex flex-wrap ${size === "md" ? "gap-3" : "gap-1"}`}>
      {tracks.map((t) => (
        <Badge
          key={t}
          variant="outline"
          className={`rounded-full font-medium tracking-wide ${size === "md" ? "h-8 border border-border bg-muted/40 px-3 py-1 text-sm" : "bg-muted px-1.5 py-0.5 text-[10px]"}`}
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
export { MetricCard } from "./MeasurementCard";
