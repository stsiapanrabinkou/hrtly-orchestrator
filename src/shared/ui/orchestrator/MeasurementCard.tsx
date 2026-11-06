import { useState } from "react";
import { ArrowRight, History } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { measurementSnapshot } from "@/flows/_mocks/measurement-readings";
import {
  measurementPeriodStart,
  defaultMeasurementPeriod,
  type MeasurementPeriod,
} from "./measurement-periods";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heading, Text } from "@/shared/ui/typography";
import type { Metric } from "@/flows/_mocks/orchestrator";

const axisDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const periodDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type Props = {
  metric: Metric;
  patientName?: string;
  patientId?: string;
  asOf?: number;
};

function MeasurementSummary({
  label,
  value,
  unit,
  secondary = false,
}: {
  label: string;
  value: string | number;
  unit: string;
  secondary?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Text variant="small" className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className={
            secondary
              ? "relative inline-block w-6 border-t-2 border-dashed border-muted-foreground after:absolute after:left-1/2 after:top-[-4px] after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-muted-foreground"
              : "relative inline-block w-6 border-t-2 border-primary after:absolute after:left-1/2 after:top-[-4px] after:size-1.5 after:-translate-x-1/2 after:rounded-full after:bg-primary"
          }
        />
        {label}
      </Text>
      <div className="mt-1 flex items-baseline gap-2">
        <Text
          as="span"
          className={`${typeof value === "number" || /^\d/.test(value) ? "text-3xl" : "text-xl"} font-semibold tracking-tight tabular-nums`}
        >
          {value}
        </Text>
        <Text as="span" variant="muted">
          {unit}
        </Text>
      </div>
    </div>
  );
}

export function MetricCard({
  metric,
  patientName,
  patientId,
  asOf = measurementSnapshot,
}: Props) {
  const allReadings = metric.readings ?? [];
  const [selectedPeriod, setSelectedPeriod] = useState<MeasurementPeriod>(() =>
    defaultMeasurementPeriod(allReadings, asOf),
  );
  const start = measurementPeriodStart(selectedPeriod, asOf);
  const readings = allReadings.filter(
    (reading) =>
      (start === null || reading.timestamp >= start) &&
      reading.timestamp <= asOf,
  );
  const showDots = readings.length <= 30;
  const bloodPressure = metric.label === "Blood pressure";
  const hasDiastolic =
    bloodPressure &&
    allReadings.some((reading) => reading.secondary !== undefined);
  const first = allReadings[0];
  const last = allReadings.at(-1);
  const elapsedHours = last
    ? Math.floor((asOf - last.timestamp) / 3_600_000)
    : null;
  const elapsed =
    elapsedHours === null || elapsedHours < 0
      ? null
      : elapsedHours >= 24
        ? `${Math.floor(elapsedHours / 24)} ${Math.floor(elapsedHours / 24) === 1 ? "day" : "days"} ago`
        : !last?.dateLabel.includes("UTC")
          ? "Today"
          : elapsedHours >= 1
            ? `${elapsedHours} ${elapsedHours === 1 ? "hour" : "hours"} ago`
            : "Less than an hour ago";
  const rangeStart = start ?? first?.timestamp ?? asOf - 86400000;
  const visibleFirst = readings[0];
  const visibleLast = readings.at(-1);
  const singleTimestamp = visibleFirst?.timestamp === visibleLast?.timestamp;
  const axisStart = visibleFirst
    ? visibleFirst.timestamp - (singleTimestamp ? 86400000 : 0)
    : rangeStart;
  const axisEnd = visibleLast
    ? visibleLast.timestamp + (singleTimestamp ? 86400000 : 0)
    : asOf;
  const dateTicks =
    readings.length <= 8
      ? [...new Set(readings.map((reading) => reading.timestamp))]
      : [0, 1, 2, 3, 4].map(
          (index) => axisStart + ((axisEnd - axisStart) * index) / 4,
        );
  const range = `${periodDate.format(rangeStart)} – ${periodDate.format(asOf)}`;
  const config = {
    value: {
      label: bloodPressure ? "Systolic" : metric.label,
      color: "var(--primary)",
    },
    ...(hasDiastolic
      ? { secondary: { label: "Diastolic", color: "var(--muted-foreground)" } }
      : {}),
  } satisfies ChartConfig;
  const period =
    first && last
      ? first.timestamp === last.timestamp
        ? periodDate.format(first.timestamp)
        : `${periodDate.format(first.timestamp)} – ${periodDate.format(last.timestamp)}`
      : "No recorded measurements";
  return (
    <Card className="min-w-0 gap-0 rounded-xl p-5 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={4} as="h3">
          {metric.label}
        </Heading>
        <Select
          value={selectedPeriod}
          onValueChange={(value) =>
            setSelectedPeriod(value as MeasurementPeriod)
          }
        >
          <SelectTrigger
            aria-label={`${metric.label} chart period`}
            className="w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last month</SelectItem>
            <SelectItem value="quarter">Last 3 months</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div
        role="group"
        aria-label={`${metric.label} latest values and chart legend`}
        className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4"
      >
        <MeasurementSummary
          label={bloodPressure ? "Systolic" : metric.label}
          value={bloodPressure ? (last?.value ?? metric.value) : metric.value}
          unit={metric.unit}
        />
        {hasDiastolic && (
          <>
            <Separator
              orientation="vertical"
              className="h-12 w-px self-center"
            />
            <MeasurementSummary
              label="Diastolic"
              value={last?.secondary ?? "Not recorded"}
              unit={metric.unit}
              secondary
            />
          </>
        )}
      </div>
      {readings.length ? (
        <>
          <Text variant="small" className="mt-3" aria-hidden="true">
            {metric.unit}
          </Text>
          <ChartContainer
            config={config}
            className="mt-1 h-56 w-full aspect-auto [&_.recharts-surface]:focus-visible:outline-2 [&_.recharts-surface]:focus-visible:outline-ring"
            aria-label={`${metric.label} history. ${range}. ${readings.length} ${readings.length === 1 ? "measurement" : "measurements"}. Use left and right arrow keys to inspect values.`}
          >
            <LineChart
              accessibilityLayer
              data={readings}
              margin={{ top: 12, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={[axisStart, axisEnd]}
                ticks={dateTicks}
                interval="preserveStartEnd"
                tickFormatter={(value) => axisDate.format(Number(value))}
                tickLine={false}
                axisLine={false}
                minTickGap={35}
                tickMargin={10}
                height={35}
                tickCount={4}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={42}
                allowDecimals={metric.label === "HbA1c"}
                tickCount={5}
              />
              <ChartTooltip
                isAnimationActive={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) => (
                      <span>
                        {payload[0]?.payload?.dateLabel ??
                          "Recorded measurement"}
                        {metric.unit && ` · ${metric.unit}`}
                      </span>
                    )}
                  />
                }
              />
              <Line
                name="value"
                dataKey="value"
                type="linear"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={
                  showDots
                    ? { r: 3, fill: "var(--color-value)", strokeWidth: 0 }
                    : false
                }
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                connectNulls={false}
              />
              {hasDiastolic && (
                <Line
                  name="secondary"
                  dataKey="secondary"
                  type="linear"
                  stroke="var(--color-secondary)"
                  strokeDasharray="5 3"
                  strokeWidth={2}
                  dot={
                    showDots
                      ? { r: 3, fill: "var(--color-secondary)", strokeWidth: 0 }
                      : false
                  }
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ChartContainer>
          {readings.length === 1 && (
            <Text variant="small" className="mt-3">
              {allReadings.length > 1
                ? "One measurement in this period. Select a longer period to see a trend."
                : "Only one measurement recorded. More measurements are needed to show a trend."}
            </Text>
          )}
          <Text variant="small" className="sr-only">
            Horizontal axis: measurement date. Vertical axis:{" "}
            {metric.unit || metric.label}.{" "}
            {hasDiastolic
              ? "Solid line: systolic. Dashed line: diastolic."
              : "Each point represents a recorded measurement."}
          </Text>
        </>
      ) : (
        <div className="mt-5 flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 p-5 text-center">
          <History className="size-5 text-muted-foreground" />
          <Text variant="muted">
            {allReadings.length
              ? "No measurements in this period"
              : "No recorded measurements"}
          </Text>
          <Text variant="small">
            {allReadings.length
              ? "Try a longer period to view earlier readings."
              : "A chart will appear when measurements are available."}
          </Text>
          {allReadings.length > 0 && (
            <Button
              variant="outline"
              className="mt-2 h-10"
              onClick={() => setSelectedPeriod("all")}
            >
              Show all time
            </Button>
          )}
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <Text variant="small" className="min-w-0 flex-1">
          {last ? `Latest measurement: ${metric.date}${elapsed ? ` · ${elapsed}` : ""}` : metric.note}
        </Text>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="h-10"
              aria-label={`View all ${allReadings.length} ${metric.label.toLowerCase()} measurements`}
            >
              Measurements
              <Badge variant="secondary">{allReadings.length}</Badge>
              <ArrowRight className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="gap-0 data-[side=right]:top-(--devbar-height) data-[side=right]:h-[calc(100svh-var(--devbar-height))] data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
            <div className="shrink-0 border-b p-5 pr-12">
              <SheetTitle>{metric.label} history</SheetTitle>
              <SheetDescription className="sr-only">
                {patientName}{patientId ? ` · ${patientId}` : ""} · {metric.label} measurements
              </SheetDescription>
              <Text variant="small" className="mt-3">
                {period} · {allReadings.length}{" "}
                {allReadings.length === 1 ? "measurement" : "measurements"}
              </Text>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {allReadings.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / time</TableHead>
                      <TableHead className="text-right">
                        {bloodPressure ? "Systolic" : metric.label}
                        {metric.unit && ` (${metric.unit})`}
                      </TableHead>
                      {hasDiastolic && (
                        <TableHead className="text-right">
                          Diastolic ({metric.unit})
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReadings.toReversed().map((reading, index) => (
                      <TableRow key={`${reading.timestamp}-${index}`}>
                        <TableCell className="whitespace-normal">
                          {reading.dateLabel}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {reading.value}
                        </TableCell>
                        {hasDiastolic && (
                          <TableCell className="text-right font-medium tabular-nums">
                            {reading.secondary ?? "Not recorded"}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Text
                  variant="muted"
                  className="rounded-lg border border-dashed p-5"
                >
                  No historical values recorded for this metric.
                </Text>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
}
