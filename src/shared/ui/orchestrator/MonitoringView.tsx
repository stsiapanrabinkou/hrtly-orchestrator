import { PreviewLink } from "./FlowNavigation";
import { SearchField } from "./SearchField";
import { dropdownStyles } from "@/shared/ui/dropdown-styles";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  RefreshCw,
  CircleAlert,
  AlertTriangle,
  Clock3,
  ListFilter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import { Flag, TrackBadges, BlankState } from "./Clinical";
import {
  monitoringViews,
  cohortStats,
  type Patient,
} from "@/flows/_mocks/orchestrator";
import { combinedCareTrackStats } from "@/flows/_mocks/care-track-stats";
import { careGapInsights } from "@/flows/_mocks/care-gap-insights";
import { preparedViews } from "@/flows/_mocks/prepared-views";

type Props = {
  view?: string;
  views?: typeof monitoringViews;
  presets?: typeof preparedViews;
  stats?: typeof cohortStats;
  insights?: typeof careGapInsights;
  trackStats?: typeof combinedCareTrackStats;
  onViewChange?: (view: string) => void;
  appBase?: string;
};
const careTracks = ["ckm", "eckm", "bh", "msk"];
const trackLabel = (track: string) => track === "eckm" ? "eCKM" : track.toUpperCase();

type SortColumn = "name" | "track" | "risk" | "alert" | "recency";
type SortDirection = "ascending" | "descending";

type PatientSorting = { column: SortColumn; direction: SortDirection };

function sortPatients(rows: Patient[], sorting: PatientSorting) {
  const sortValue = (patient: Patient): string | number => {
    switch (sorting.column) {
      case "name": return patient.name;
      case "track": return patient.tracks.join(", ");
      case "risk": return Number(patient.risk);
      case "alert": return { red: 0, yellow: 1, none: 2 }[patient.flag];
      // The snapshot's display dates omit the year; use a common leap year to compare them.
      case "recency": return Date.parse(patient.lastDate.replace(" · ", ", 2000 "));
    }
  };
  const sortedRows = [...rows].sort((a, b) => {
    const first = sortValue(a);
    const second = sortValue(b);
    // Missing risk scores and measurements stay at the end in either direction.
    if (typeof first === "number" && Number.isNaN(first)) {
      return typeof second === "number" && Number.isNaN(second) ? 0 : 1;
    }
    if (typeof second === "number" && Number.isNaN(second)) return -1;
    const order = typeof first === "string" && typeof second === "string"
      ? first.localeCompare(second)
      : Number(first) - Number(second);
    return sorting.direction === "ascending" ? order : -order;
  });
  return sortedRows;
}

function PatientRows({
  rows,
  view,
  appBase,
  sorting,
  onSort,
}: {
  rows: Patient[];
  view: string;
  appBase: string;
  sorting: PatientSorting;
  onSort: (sorting: PatientSorting) => void;
}) {
  const columns: { key: SortColumn; label: string; className?: string }[] = [
    { key: "name", label: "Patient", className: "w-[21%] pl-5" },
    { key: "track", label: "Care track", className: "w-[11%]" },
    { key: "risk", label: "Risk", className: "w-[7%] text-right" },
    { key: "alert", label: "Alert status", className: "w-[15%]" },
    { key: "recency", label: "Last measurement", className: "w-[21%]" },
  ];
  return (
    <>
      <div className="hidden xl:block">
    <Table className="min-w-[960px] table-fixed">
      <TableCaption className="sr-only">
        Active monitored patients. Dates and times use UTC. Select a column heading to sort.
      </TableCaption>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          {columns.map(({ key, label, className }) => {
            const active = sorting.column === key;
            const Icon = active ? sorting.direction === "ascending" ? ArrowUp : ArrowDown : ArrowUpDown;
            return (
              <TableHead key={key} className={className} aria-sort={active ? sorting.direction : undefined}>
                <Button
                  variant="ghost"
                  className={`-mx-2 h-10 gap-1.5 px-2 text-xs ${active ? "text-foreground" : "text-muted-foreground"}`}
                  onClick={() => onSort({
                    column: key,
                    direction: active
                      ? sorting.direction === "ascending" ? "descending" : "ascending"
                      : key === "risk" ? "descending" : "ascending",
                  })}
                >
                  {label}
                  <Icon aria-hidden="true" className="size-3.5" />
                </Button>
              </TableHead>
            );
          })}
          <TableHead className="w-[19%] text-xs text-muted-foreground">Latest values</TableHead>
          <TableHead className="w-[6%]"><span className="sr-only">Open patient</span></TableHead>
        </TableRow>
      </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                id={`patient-${p.displayId}`}
                className="relative scroll-mt-28 cursor-pointer hover:bg-muted/40 has-focus-visible:bg-muted/40"
              >
                <TableCell className="py-3 pl-5">
                  <PreviewLink
                    className="inline-block rounded-sm font-semibold text-foreground underline-offset-4 after:absolute after:inset-0 hover:text-primary hover:underline"
                    href={`${appBase}/patients/${p.id}/from/${view}`}
                  >
                    {p.name}
                  </PreviewLink>
                  <Text variant="small" className="mt-1">
                    {p.dob} <span className="mx-1 text-border">·</span>{" "}
                    {p.displayId}
                  </Text>
                </TableCell>
                <TableCell>
                  <TrackBadges tracks={p.tracks} />
                </TableCell>
                <TableCell className="whitespace-normal text-right font-medium tabular-nums">
                  {p.risk}
                </TableCell>
                <TableCell>
                  <Flag flag={p.flag} />
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
                  <Text className="whitespace-normal font-medium tabular-nums">{p.reading}</Text>
                  <Text variant="small" className="mt-1">
                    {p.readingDate}
                  </Text>
                </TableCell>
                <TableCell className="pr-5">
                  <Button asChild variant="ghost" size="icon">
                    <PreviewLink
                      href={`${appBase}/patients/${p.id}/from/${view}`}
                      aria-label={`Open patient ${p.name}`}
                      className="relative z-10"
                    >
                      <ChevronRight />
                    </PreviewLink>
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
                <PreviewLink
                  href={`${appBase}/patients/${p.id}/from/${view}`}
                  className="rounded-sm font-semibold underline-offset-4 hover:underline"
                >
                  {p.name}
                </PreviewLink>
                <Text variant="small" className="mt-1">
                  {p.dob} · {p.displayId}
                </Text>
              </div>
              <Flag flag={p.flag} />
            </div>
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
            <Button asChild variant="outline" className="w-full">
              <PreviewLink href={`${appBase}/patients/${p.id}/from/${view}`}>
                Open patient
                <ArrowRight />
              </PreviewLink>
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
  insights = careGapInsights,
  trackStats = combinedCareTrackStats,
  onViewChange,
  appBase = "",
}: Props) {
  const state = views[view] ?? presets[view] ?? views.all;
  const [sorting, setSorting] = useState<PatientSorting>({
    column: state.sort === "name" || state.sort === "recency" ? state.sort : "risk",
    direction: state.sort === "risk" ? "descending" : "ascending",
  });
  const [pageSize, setPageSize] = useState(10);
  const [pageJump, setPageJump] = useState("");
  const [query, setQuery] = useState(state.query);
  const [filtersChanged, setFiltersChanged] = useState(false);
  const [selection, setSelection] = useState({
    alert: state.alert,
    recency: state.recency,
    tracks: state.track === "all" ? [] : [state.track],
  });
  const tracksLabel = selection.tracks.length ? selection.tracks.map(trackLabel).join(", ") : "All tracks";
  const initialCohort = state.query
    ? presets[`${state.alert}-${state.track}-${state.recency}-${state.sort}`] ?? views.all
    : state;
  const selectedRows = (selection.tracks.length ? selection.tracks : ["all"]).flatMap(
    (track) => (presets[`${selection.alert}-${track}-${selection.recency}-${state.sort}`]?.rows ?? []),
  );
  const cohortRows = filtersChanged && !["loading", "error", "empty"].includes(state.mode ?? "")
    ? [...new Map(selectedRows.map((patient) => [patient.id, patient])).values()]
    : initialCohort.rows;
  const searchTerm = query.trim().toLocaleLowerCase();
  const rows = searchTerm.length >= 2
    ? cohortRows.filter((patient) =>
        patient.name.toLocaleLowerCase().includes(searchTerm) ||
        patient.displayId.toLocaleLowerCase().includes(searchTerm),
      )
    : cohortRows;
  const count = rows.length;
  const sortedRows = sortPatients(rows, sorting);
  const [page, setPage] = useState(() => {
    const target = typeof window === "undefined" ? "" : window.location.hash.slice(1);
    const index = sortedRows.findIndex((patient) => `patient-${patient.displayId}` === target);
    return index < 0 ? 1 : Math.floor(index / 10) + 1;
  });
  const pageCount = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(pageStart, pageStart + pageSize);
  const visiblePages = pageCount <= 7
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : [...new Set([
        1,
        pageCount,
        ...(currentPage <= 3 ? [2, 3, 4]
          : currentPage >= pageCount - 2 ? [pageCount - 3, pageCount - 2, pageCount - 1]
          : [currentPage - 1, currentPage, currentPage + 1]),
      ])].sort((a, b) => a - b);
  const fixedMode = initialCohort.mode === "no-results" ? undefined : initialCohort.mode;
  const mode = !fixedMode || fixedMode === "stale"
    ? rows.length === 0 ? "no-results" : fixedMode
    : fixedMode;
  const chips = [
    ...selection.tracks.map(trackLabel),
    ...(selection.alert !== "all" ? [{ red: "Critical", yellow: "Warning", clear: "No alerts" }[selection.alert]] : []),
    ...(selection.recency !== "all" ? [selection.recency === "never" ? "No measurements" : "More than 7 days"] : []),
  ];
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const go = (next: string) => {
    setPage(1);
    if (next === "all") {
      setSelection({ alert: "all", recency: "all", tracks: [] });
      setFiltersChanged(true);
      setQuery("");
    }
    setFiltersOpen(false);
    setInsightsOpen(false);
    onViewChange?.(next);
  };
  const choose = (field: "alert" | "recency", value: string) => {
    setPage(1);
    setSelection((current) => ({ ...current, [field]: value }));
    setFiltersChanged(true);
  };
  const toggleTrack = (track: string) => {
    setPage(1);
    setSelection((current) => ({
      ...current,
      tracks: careTracks.filter((candidate) => candidate === track
        ? !current.tracks.includes(candidate)
        : current.tracks.includes(candidate)),
    }));
    setFiltersChanged(true);
  };
  const group = selection.tracks.length > 1
    ? trackStats[selection.tracks.join(",")] ?? stats.all
    : stats[(selection.tracks[0] ?? "all") as keyof typeof stats] ?? stats.all;
  const numbers = state.mode === "empty" ? stats.empty : group;
  const unavailable = state.mode === "loading" || state.mode === "error";
  const visibleInsights = state.mode === "empty" ? [] : insights.filter(
    (insight) => selection.tracks.length === 0 || selection.tracks.includes(insight.track),
  );
  const filters = (
    <div className="grid gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="alert-filter" className="text-xs text-muted-foreground">
          Alert status
        </Label>
        <Select value={selection.alert} onValueChange={(v) => choose("alert", v)}>
          <SelectTrigger id="alert-filter" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All alerts</SelectItem>
            <SelectItem value="red">Critical</SelectItem>
            <SelectItem value="yellow">Warning</SelectItem>
            <SelectItem value="clear">No alerts</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="track-filter" className="text-xs text-muted-foreground">
          Care track
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button id="track-filter" variant="outline" className={`${dropdownStyles.trigger} w-full`} title={tracksLabel}>
              <span className="min-w-0 truncate">{tracksLabel}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            <DropdownMenuCheckboxItem
              checked={selection.tracks.length === 0}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => {
                setPage(1);
                setSelection((current) => ({ ...current, tracks: [] }));
                setFiltersChanged(true);
              }}
            >All tracks</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {careTracks.map((track) => (
              <DropdownMenuCheckboxItem
                key={track}
                checked={selection.tracks.includes(track)}
                onSelect={(event) => event.preventDefault()}
                onCheckedChange={() => toggleTrack(track)}
              >{trackLabel(track)}</DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="recency-filter"
          className="text-xs text-muted-foreground"
        >
          Measurement recency
        </Label>
        <Select
          value={selection.recency}
          onValueChange={(v) => choose("recency", v)}
        >
          <SelectTrigger id="recency-filter" className="w-full">
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
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Heading level={1}>Monitoring</Heading>
        <div className="flex flex-wrap items-center gap-3">
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
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          "Critical alerts",
          "Warnings",
          "No measurements >7 days",
        ].map((label, i) => {
          const Icon = [CircleAlert, AlertTriangle, Clock3][i];
          const next = i === 0 ? "red" : i === 1 ? "yellow" : "overdue";
          const tone = i === 0
            ? "text-danger bg-danger-soft"
            : i === 1
              ? "text-warning bg-warning-soft"
              : "text-primary bg-accent";
          return (
            <Card key={label} className="gap-0 rounded-xl p-0 shadow-none">
              <Button
                variant="ghost"
                className="flex h-full min-h-32 w-full flex-col items-start gap-3 whitespace-normal rounded-xl p-4 text-left hover:bg-muted/40 sm:p-5"
                disabled={unavailable}
                onClick={() => choose(i === 2 ? "recency" : "alert", next)}
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
                    {numbers[i + 1]}
                  </span>
                )}
              </Button>
            </Card>
          );
        })}
          <Sheet open={insightsOpen} onOpenChange={setInsightsOpen}>
            <Card className="gap-0 rounded-xl bg-secondary text-primary p-0 shadow-none">
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-full min-h-32 w-full flex-col items-start gap-3 whitespace-normal rounded-xl p-4 text-left text-primary hover:bg-secondary-hover hover:text-primary sm:p-5"
                  disabled={unavailable}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <Text as="span" variant="small" className="font-medium text-primary">Care gap insights</Text>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card/50 text-primary">
                      <ClipboardList className="size-3.5" />
                    </span>
                  </div>
                  <div className="flex w-full items-baseline justify-between gap-2">
                    {unavailable ? (
                      <Skeleton className="h-9 w-12" />
                    ) : (
                      <span className="text-3xl font-semibold tracking-tight tabular-nums">
                        {visibleInsights.length}
                      </span>
                    )}
                    <span className="inline-flex items-baseline gap-1.5 pr-[7px] text-xs text-primary">
                      View all <ArrowRight className="size-3.5 self-center" />
                    </span>
                  </div>
                </Button>
              </SheetTrigger>
            </Card>
            <SheetContent className="gap-0 data-[side=right]:top-(--devbar-height) data-[side=right]:h-[calc(100svh-var(--devbar-height))] data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
              <div className="shrink-0 border-b p-5 pr-12">
                <SheetTitle className="flex items-center gap-2">
                  Care gap insights
                  <Badge variant="secondary">{visibleInsights.length}</Badge>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Monitoring gaps across {selection.tracks.length ? tracksLabel : "all care tracks"}.
                </SheetDescription>
                <Text variant="small" className="mt-2">Updated Oct 19, 2026 · 12:00 UTC</Text>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {visibleInsights.length ? (
                  <div className="space-y-4">
                    {visibleInsights.map((insight) => (
                      <Card key={insight.id} className="gap-0 rounded-xl p-5 shadow-none">
                        <Badge variant="secondary" className="mb-3">{insight.track === "eckm" ? "eCKM" : insight.track.toUpperCase()}</Badge>
                        <Heading level={3} as="h3">{insight.title}</Heading>
                        <Text variant="muted" className="mt-2">{insight.summary}</Text>
                        <div className="mt-4 border-t pt-3">
                          <Text variant="small" className="font-medium text-foreground">Suggested action</Text>
                          <Text variant="small" className="mt-1 leading-relaxed">{insight.action}</Text>
                        </div>
                        <Button variant="outline" className="mt-4 w-full" onClick={() => go(insight.view)}>
                          View patients
                          <ArrowRight className="size-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <ClipboardList className="mx-auto mb-3 size-6 text-muted-foreground" />
                    <Heading level={3} as="h3">No care gap insights</Heading>
                    <Text variant="muted" className="mt-2">There are no summaries for this cohort in the current snapshot.</Text>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
      </div>
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
        className="clinical-panel overflow-hidden [overflow-anchor:none]"
      >
        <div className="border-b p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Heading level={3} as="h2" className="flex items-center gap-2">
              Patients
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {count}
              </span>
            </Heading>
          </div>
          <div className="flex items-end gap-4 lg:grid lg:grid-cols-4">
            <div className="min-w-0 flex-1">
              <Label
                htmlFor="patient-search"
                className="mb-1.5 block text-xs text-muted-foreground"
              >
                Search patients
              </Label>
              <SearchField
                id="patient-search"
                placeholder="Name or patient ID"
                value={query}
                onValueChange={(value) => { setQuery(value); setPage(1); }}
              />
            </div>
            <div className="hidden lg:col-span-3 lg:block [&>div]:grid-cols-3">{filters}</div>
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-10 lg:hidden">
                  <ListFilter />
                  Filters
                  {chips.length ? (
                    <Badge variant="secondary">{chips.length}</Badge>
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
          {chips.length ? (
            <div
              className="mt-4 flex flex-wrap items-center gap-2"
              aria-label="Applied filters"
            >
              {chips.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="rounded-full px-2 py-1"
                >
                  {c}
                </Badge>
              ))}
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => go("all")}
              >
                <X className="size-3" />
                Clear all
              </Button>
            </div>
          ) : null}
        </div>
        {mode && mode !== "stale" ? (
          <BlankState kind={mode} onReset={() => { setQuery(""); go("all"); }} />
        ) : (
          <PatientRows
            rows={pageRows}
            view={view}
            appBase={appBase}
            sorting={sorting}
            onSort={(next) => { setSorting(next); setPage(1); }}
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
          <Text variant="small" aria-live="polite">
            {unavailable ? "Patient data unavailable" : count === 0 ? "0 records shown" : `${pageStart + 1}–${pageStart + pageRows.length} of ${count} records shown`}
          </Text>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="patients-page-size" className="text-xs text-muted-foreground">Rows per page</Label>
              <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }} disabled={unavailable}>
                <SelectTrigger id="patients-page-size" className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <nav aria-label="Patient pagination" className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={unavailable || currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft />
            </Button>
            {visiblePages.map((number, index) => (
              <span key={number} className="inline-flex items-center gap-1">
                {index > 0 && number - visiblePages[index - 1] > 1 ? (
                  <span className="px-1 text-muted-foreground" aria-hidden="true">…</span>
                ) : null}
                <Button
                  variant={number === currentPage ? "default" : "outline"}
                  size="icon"
                  aria-label={`Go to page ${number}`}
                  aria-current={number === currentPage ? "page" : undefined}
                  disabled={unavailable}
                  onClick={() => setPage(number)}
                >{number}</Button>
              </span>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={unavailable || currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRight />
            </Button>
            </nav>
            <form
              className="flex items-center gap-2"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                const target = Number(pageJump);
                if (!pageJump.trim() || !Number.isFinite(target)) return;
                setPage(Math.max(1, Math.min(pageCount, Math.floor(target))));
                setPageJump("");
              }}
            >
              <Label htmlFor="patients-page-jump" className="text-xs text-muted-foreground">Go to</Label>
              <Input
                id="patients-page-jump"
                type="number"
                inputMode="numeric"
                min={1}
                max={pageCount}
                step={1}
                className="h-10 w-16 bg-card px-2 text-xs"
                placeholder={String(currentPage)}
                value={pageJump}
                onChange={(event) => setPageJump(event.target.value)}
                disabled={unavailable || count === 0}
              />
              <Button type="submit" variant="outline" disabled={unavailable || count === 0 || !pageJump.trim()}>Go</Button>
            </form>
          </div>
        </div>
      </section>
    </Shell>
  );
}
