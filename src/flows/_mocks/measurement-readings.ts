/** Presentation fixtures: expand existing dated history into chart/table records.
 * Dates without a recorded time stay date-only in the UI. UTC midnight is used
 * solely for positioning those dates on the chart's time axis.
 */
export const measurementSnapshot = Date.UTC(2026, 9, 19, 12);

export type MeasurementReading = {
  timestamp: number;
  dateLabel: string;
  value: number;
  secondary?: number;
};

export function createMeasurementReadings(metric: {
  history?: string;
  value: string;
  date: string;
}): MeasurementReading[] {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const entries = metric.history?.split(/;\s*/) ?? [];
  const readings = entries.flatMap((entry) => {
    const match = entry.match(
      /^([A-Za-z]{3}) (\d{1,2}):\s*([\d.]+)(?:\/([\d.]+))?/,
    );
    if (!match) return [];
    const [, month, day, value, secondary] = match;
    const monthIndex = months.indexOf(month);
    if (monthIndex < 0) return [];
    return [
      {
        timestamp: Date.UTC(2026, monthIndex, Number(day)),
        dateLabel: `${month} ${day}, 2026`,
        value: Number(value),
        ...(secondary ? { secondary: Number(secondary) } : {}),
      },
    ];
  });
  const latestTimestamp = Date.parse(
    `${metric.date.replace(" · ", " ")}${metric.date.includes("UTC") ? "" : " UTC"}`,
  );
  const latest = readings.at(-1);
  if (
    latest &&
    Number.isFinite(latestTimestamp) &&
    new Date(latestTimestamp).toISOString().slice(0, 10) ===
      new Date(latest.timestamp).toISOString().slice(0, 10)
  ) {
    latest.timestamp = latestTimestamp;
    latest.dateLabel = metric.date;
  }
  if (!readings.length && Number.isFinite(latestTimestamp)) {
    const value = metric.value.match(/^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/);
    if (value)
      readings.push({
        timestamp: latestTimestamp,
        dateLabel: metric.date,
        value: Number(value[1]),
        ...(value[2] ? { secondary: Number(value[2]) } : {}),
      });
  }
  return readings.sort((a, b) => a.timestamp - b.timestamp);
}
