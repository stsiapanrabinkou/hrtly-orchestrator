import { useState } from "react";
import {
  Search,
  ArrowRight,
  ArrowDownWideNarrow,
  RefreshCw,
  UsersRound,
  CircleAlert,
  AlertTriangle,
  Clock3,
  ListFilter,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, BlankState } from "./Clinical";
import {
  monitoringViews,
  cohortStats,
  type Patient,
} from "@/flows/_mocks/orchestrator";
import { preparedViews } from "@/flows/_mocks/prepared-views";

type Props = {
  view?: string;
  views?: typeof monitoringViews;
  presets?: typeof preparedViews;
  stats?: typeof cohortStats;
  onViewChange?: (view: string) => void;
  appBase?: string;
};
function PatientRows({
  rows,
  view,
  appBase,
  sort,
}: {
  rows: Patient[];
  view: string;
  appBase: string;
  sort: string;
}) {
  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableCaption className="sr-only">
            Active monitored patients. Dates and times use UTC.
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead
                aria-sort={sort === "name" ? "ascending" : undefined}
                className="w-[22%] pl-5"
              >
                Patient
              </TableHead>
              <TableHead>Track</TableHead>
              <TableHead
                aria-sort={sort === "risk" ? "descending" : undefined}
                className="text-right"
              >
                Risk
              </TableHead>
              <TableHead>Alert status</TableHead>
              <TableHead
                aria-sort={sort === "recency" ? "ascending" : undefined}
              >
                Last measurement
              </TableHead>
              <TableHead>Latest values</TableHead>
              <TableHead>
                <span className="sr-only">Open patient</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                id={`patient-${p.displayId}`}
                className={`scroll-mt-28 ${p.displayId === "P-1002" ? "bg-accent/30 hover:bg-accent/50" : "hover:bg-muted/40"}`}
              >
                <TableCell className="py-4 pl-5">
                  <a
                    className="inline-block rounded-sm font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
                    href={`${appBase}/patients/${p.id}/from/${view}`}
                  >
                    {p.name}
                  </a>
                  <Text variant="small" className="mt-1">
                    {p.dob} <span className="mx-1 text-border">·</span>{" "}
                    {p.displayId}
                  </Text>
                </TableCell>
                <TableCell>
                  <TrackBadges tracks={p.tracks} />
                </TableCell>
                <TableCell className="text-right align-top pt-5 font-medium tabular-nums">
                  {p.risk}
                </TableCell>
                <TableCell>
                  <Flag flag={p.flag} />
                  <Text
                    variant="small"
                    className="mt-1.5 max-w-44 whitespace-normal"
                  >
                    {p.reason}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text
                    className={`font-medium ${p.overdue ? "text-warning" : ""}`}
                  >
                    {p.elapsed}
                    {p.overdue ? (
                      <Clock3
                        aria-hidden="true"
                        className="ml-1.5 inline size-3"
                      />
                    ) : null}
                  </Text>
                  <Text variant="small" className="mt-1">
                    {p.measurementType} <span className="text-border">·</span>{" "}
                    {p.lastDate}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text className="font-medium tabular-nums">{p.reading}</Text>
                  <Text variant="small" className="mt-1">
                    {p.readingDate}
                  </Text>
                </TableCell>
                <TableCell className="pr-5">
                  <Button asChild variant="ghost" size="icon-sm">
                    <a
                      href={`${appBase}/patients/${p.id}/from/${view}`}
                      aria-label={`Open patient ${p.name}`}
                    >
                      <ChevronRight />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="divide-y xl:hidden">
        {rows.map((p) => (
          <article
            key={p.id}
            id={`mobile-patient-${p.displayId}`}
            className="scroll-mt-28 p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <a
                  href={`${appBase}/patients/${p.id}/from/${view}`}
                  className="rounded-sm font-semibold underline-offset-4 hover:underline"
                >
                  {p.name}
                </a>
                <Text variant="small" className="mt-1">
                  {p.dob} · {p.displayId}
                </Text>
              </div>
              <Flag flag={p.flag} />
            </div>
            <Text className="mb-3">{p.reason}</Text>
            <div className="flex items-center justify-between">
              <TrackBadges tracks={p.tracks} />
              <Text variant="small">
                Risk:{" "}
                <span className="font-semibold text-foreground">{p.risk}</span>
              </Text>
            </div>
            <div className="my-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-3">
              <div>
                <Text variant="small">Last measurement</Text>
                <Text
                  className={`mt-1 font-medium ${p.overdue ? "text-warning" : ""}`}
                >
                  {p.elapsed}
                </Text>
                <Text variant="small" className="mt-1">
                  {p.measurementType} · {p.lastDate}
                </Text>
              </div>
              <div>
                <Text variant="small">Latest value</Text>
                <Text className="mt-1 font-medium">{p.reading}</Text>
                <Text variant="small" className="mt-1">
                  {p.readingDate}
                </Text>
              </div>
            </div>
            <Button asChild variant="outline" className="min-h-11 w-full">
              <a href={`${appBase}/patients/${p.id}/from/${view}`}>
                Open patient
                <ArrowRight />
              </a>
            </Button>
          </article>
        ))}
      </div>
    </>
  );
}
export function MonitoringView({
  view = "all",
  views = monitoringViews,
  presets = preparedViews,
  stats = cohortStats,
  onViewChange,
  appBase = "",
}: Props) {
  const state = views[view] ?? presets[view] ?? views.all;
  const [query, setQuery] = useState(state.query);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const go = (next: string) => {
    setFiltersOpen(false);
    onViewChange?.(next);
  };
  const choose = (
    field: "alert" | "track" | "recency" | "sort",
    value: string,
  ) => {
    const selection = {
      alert: state.alert,
      track: state.track,
      recency: state.recency,
      sort: state.sort,
      [field]: value,
    };
    go(
      `${selection.alert}-${selection.track}-${selection.recency}-${selection.sort}`,
    );
  };
  const group = stats[state.track as keyof typeof stats] ?? stats.all;
  const numbers = state.mode === "empty" ? stats.empty : group;
  const unavailable = state.mode === "loading" || state.mode === "error";
  const showGap = state.track === "all" || state.track === "ckm";
  const filters = (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="alert-filter" className="text-xs text-muted-foreground">
          Alert status
        </Label>
        <Select value={state.alert} onValueChange={(v) => choose("alert", v)}>
          <SelectTrigger id="alert-filter" className="h-10 w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All alerts</SelectItem>
            <SelectItem value="red">Red flag</SelectItem>
            <SelectItem value="yellow">Yellow flag</SelectItem>
            <SelectItem value="clear">No alerts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="track-filter" className="text-xs text-muted-foreground">
          Care track
        </Label>
        <Select value={state.track} onValueChange={(v) => choose("track", v)}>
          <SelectTrigger id="track-filter" className="h-10 w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tracks</SelectItem>
            <SelectItem value="ckm">CKM</SelectItem>
            <SelectItem value="eckm">eCKM</SelectItem>
            <SelectItem value="bh">BH</SelectItem>
            <SelectItem value="msk">MSK</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="recency-filter"
          className="text-xs text-muted-foreground"
        >
          Measurement recency
        </Label>
        <Select
          value={state.recency}
          onValueChange={(v) => choose("recency", v)}
        >
          <SelectTrigger id="recency-filter" className="h-10 w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any recency</SelectItem>
            <SelectItem value="overdue">More than 7 days</SelectItem>
            <SelectItem value="never">No measurements</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
  return (
    <Shell appBase={appBase}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Text className="section-kicker mb-2">Patient monitoring</Text>
          <Heading level={1}>Monitoring</Heading>
          <Text variant="muted" className="mt-2">
            Active patients and signals that need your attention.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text variant="small" className="hidden text-right sm:block">
            Snapshot updated
            <br />
            <span className="font-medium text-foreground">
              Oct 19, 2026 · 12:00 UTC
            </span>
          </Text>
          <Button
            variant="outline"
            className="h-10 bg-card"
            onClick={() => go("all")}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <Text variant="small">
          In the selected cohort ·{" "}
          {state.track === "all"
            ? "All care tracks"
            : state.track.toUpperCase()}
        </Text>
        <Text variant="small" className="hidden sm:block">
          Counts represent patients, not events
        </Text>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          "Active patients",
          "Red flags",
          "Yellow flags",
          "No measurements >7 days",
        ].map((label, i) => {
          const Icon = [UsersRound, CircleAlert, AlertTriangle, Clock3][i];
          const next =
            i === 0 ? "all" : i === 1 ? "red" : i === 2 ? "yellow" : "overdue";
          const tone =
            i === 1
              ? "text-danger bg-danger-soft"
              : i === 2
                ? "text-warning bg-warning-soft"
                : i === 3
                  ? "text-primary bg-accent"
                  : "text-muted-foreground bg-muted";
          return (
            <Card key={label} className="gap-0 rounded-xl p-0 shadow-none">
              <Button
                variant="ghost"
                className="flex h-full min-h-32 w-full flex-col items-start gap-3 whitespace-normal rounded-xl p-4 text-left hover:bg-muted/40 sm:p-5"
                disabled={unavailable}
                onClick={() =>
                  i === 0
                    ? go(`all-${state.track}-all-${state.sort}`)
                    : choose(
                        i === 3 ? "recency" : "alert",
                        i === 3 ? "overdue" : next,
                      )
                }
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <Text as="span" variant="small" className="font-medium">
                    {label}
                  </Text>
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${tone}`}
                  >
                    <Icon className="size-3.5" />
                  </span>
                </div>
                {unavailable ? (
                  <Skeleton className="h-9 w-12" />
                ) : (
                  <span className="text-3xl font-semibold tracking-tight tabular-nums">
                    {numbers[i]}
                  </span>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
      {!unavailable && state.mode !== "empty" && showGap ? (
        <div className="mb-7 flex flex-wrap items-center gap-4 rounded-xl border border-primary/15 bg-accent/50 px-5 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
            <ActivityIcon />
          </div>
          <div className="flex-1">
            <Text className="font-semibold">
              Blood pressure monitoring gaps
            </Text>
            <Text variant="muted" className="mt-1">
              2 of 4 CKM patients have no blood pressure readings for more than
              7 days.
            </Text>
          </div>
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => go("gap")}
          >
            View patients
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="mb-6" />
      )}
      {state.mode === "stale" ? (
        <div
          role="alert"
          className="mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-warning/20 bg-warning-soft p-4 text-warning"
        >
          <AlertTriangle className="size-4" />
          <Text className="flex-1 text-warning">
            Refresh failed. Showing the previous snapshot from Oct 19, 2026,
            12:00 UTC.
          </Text>
          <Button variant="outline" onClick={() => go("all")}>
            Retry refresh
          </Button>
        </div>
      ) : null}
      <section
        aria-label="Monitored patients"
        className="clinical-panel overflow-hidden"
      >
        <div className="border-b p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Heading level={3} as="h2">
              Patients{" "}
              <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {state.count}
              </span>
            </Heading>
            <Text variant="small" className="hidden sm:block">
              Active enrollment only
            </Text>
          </div>
          <div className="flex items-end gap-3">
            <form
              className="min-w-0 flex-1 lg:max-w-sm"
              onSubmit={(e) => {
                e.preventDefault();
                go(
                  query === "Thomas Reed" || query === "P-1002"
                    ? "search"
                    : query === ""
                      ? "all"
                      : "no-results",
                );
              }}
            >
              <Label
                htmlFor="patient-search"
                className="mb-1.5 block text-xs text-muted-foreground"
              >
                Search patients
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input
                  id="patient-search"
                  className="h-10 bg-card pl-9 pr-20"
                  placeholder="Name or patient ID"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                <Button
                  size="sm"
                  type="submit"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8"
                >
                  Search
                </Button>
              </div>
            </form>
            <div className="hidden flex-1 lg:block">{filters}</div>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 lg:hidden">
                  <ListFilter />
                  Filters
                  {state.chips.length ? (
                    <Badge variant="secondary">{state.chips.length}</Badge>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto px-5 py-8 data-[side=right]:top-(--devbar-height) data-[side=right]:h-[calc(100svh-var(--devbar-height))]">
                <SheetTitle>Filter patients</SheetTitle>
                <SheetDescription>
                  Choose a care track, alert status, or measurement recency.
                </SheetDescription>
                <div className="mt-6">{filters}</div>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => go("all")}
                >
                  Clear all filters
                </Button>
              </SheetContent>
            </Sheet>
          </div>
          {state.chips.length ? (
            <div
              className="mt-4 flex flex-wrap items-center gap-2"
              aria-label="Applied filters"
            >
              {state.chips.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="rounded-md px-2 py-1"
                >
                  {c}
                </Badge>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-muted-foreground"
                onClick={() => go("all")}
              >
                <X className="size-3" />
                Clear all
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-5 py-3">
          <Text variant="small" aria-live="polite">
            {unavailable
              ? "Patient data unavailable"
              : `${state.count} patients shown`}
          </Text>
          <div className="flex items-center gap-2">
            <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" />
            <Label htmlFor="sort-order" className="sr-only">
              Sort patients
            </Label>
            <Select value={state.sort} onValueChange={(v) => choose("sort", v)}>
              <SelectTrigger
                id="sort-order"
                className="h-8 border-0 text-xs shadow-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk: high to low</SelectItem>
                <SelectItem value="recency">
                  Measurement: oldest first
                </SelectItem>
                <SelectItem value="name">Name: A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {state.mode && state.mode !== "stale" ? (
          <BlankState kind={state.mode} onReset={() => go("all")} />
        ) : (
          <PatientRows
            rows={state.rows}
            view={view}
            appBase={appBase}
            sort={state.sort}
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
          <Text variant="small">
            {unavailable ? "—" : `${state.count} patients`} · One row per
            patient
          </Text>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              disabled
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            <Text variant="small">Page 1 of 1</Text>
            <Button
              variant="outline"
              size="icon-sm"
              disabled
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>
      <div className="mt-4 flex gap-2">
        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <Text variant="small" className="leading-relaxed">
          Risk, alert status, and monitoring gaps are separate signals. Latest measurement may be any tracked metric;
          individual values show their own dates.
        </Text>
      </div>
    </Shell>
  );
}
function ActivityIcon() {
  return <ListFilter className="size-4" />;
}
