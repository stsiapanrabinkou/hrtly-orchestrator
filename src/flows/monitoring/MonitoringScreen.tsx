import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { MonitoringView } from "@/shared/ui/orchestrator/MonitoringView";
import { monitoringViews, cohortStats } from "../_mocks/orchestrator";
import { preparedViews } from "../_mocks/prepared-views";

type Props = {
  views?: typeof monitoringViews;
  presets?: typeof preparedViews;
  stats?: typeof cohortStats;
};
export default function MonitoringScreen({
  views = monitoringViews,
  presets = preparedViews,
  stats = cohortStats,
}: Props) {
  const { view = "all" } = useParams({ strict: false });
  const navigate = useNavigate();
  // Restore the visible row when returning from a patient, including card layout.
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (!target) return;
    const anchor = document.getElementById(
      window.matchMedia("(min-width: 1280px)").matches
        ? target
        : `mobile-${target}`,
    );
    anchor?.scrollIntoView({ block: "center" });
    anchor?.querySelector("a")?.focus({ preventScroll: true });
  }, [view]);
  return (
    <MonitoringView
      key={view}
      view={view}
      views={views}
      presets={presets}
      stats={stats}
      onViewChange={(next) => {
        void navigate({ to: `/monitoring/${next}` });
      }}
    />
  );
}
