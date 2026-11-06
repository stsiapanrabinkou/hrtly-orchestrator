export type MeasurementPeriod = "week" | "month" | "quarter" | "year" | "all";

/** Prefer a month, widening the initial display until a trend can be shown.
 * Three observations is a display rule, not a clinical confidence threshold.
 */
export function defaultMeasurementPeriod(
  readings: ReadonlyArray<{ timestamp: number }>,
  asOf: number,
): MeasurementPeriod {
  const available = readings.filter((reading) => reading.timestamp <= asOf);
  if (!available.length) return "month";
  for (const period of ["month", "quarter", "year"] as const) {
    const start = measurementPeriodStart(period, asOf)!;
    if (new Set(available.filter((reading) => reading.timestamp >= start).map(reading => reading.timestamp)).size >= 3)
      return period;
  }
  return "all";
}

/** Calendar windows for displaying existing observations; no clinical aggregation. */
export function measurementPeriodStart(
  period: MeasurementPeriod,
  asOf: number,
): number | null {
  if (period === "all") return null;
  const end = new Date(asOf);
  const year = end.getUTCFullYear();
  const month = end.getUTCMonth();
  const day = end.getUTCDate();
  if (period === "week") return Date.UTC(year, month, day - 6);
  const monthsBack = period === "month" ? 1 : period === "quarter" ? 3 : 12;
  const lastDay = new Date(
    Date.UTC(year, month - monthsBack + 1, 0),
  ).getUTCDate();
  return Date.UTC(year, month - monthsBack, Math.min(day, lastDay));
}
