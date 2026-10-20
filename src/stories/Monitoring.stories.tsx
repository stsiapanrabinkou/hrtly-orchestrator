import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { MonitoringView } from "@/shared/ui/orchestrator/MonitoringView";

const meta = {
  title: "Orchestrator/Monitoring",
  component: MonitoringView,
  parameters: { layout: "fullscreen" },
  args: { appBase: "http://localhost:5173" },
  render: function Preview(args) {
    const [view, setView] = useState(args.view ?? "all");
    return (
      <MonitoringView {...args} key={view} view={view} onViewChange={setView} />
    );
  },
} satisfies Meta<typeof MonitoringView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllPatients: Story = { args: { view: "all" } };
export const RedFlags: Story = { args: { view: "red" } };
export const YellowFlags: Story = { args: { view: "yellow" } };
export const NoAlerts: Story = { args: { view: "clear" } };
export const OverSevenDays: Story = { args: { view: "overdue" } };
export const CareGap: Story = { args: { view: "gap" } };
export const NoMeasurements: Story = { args: { view: "never" } };
export const SearchResult: Story = { args: { view: "search" } };
export const NoSearchResults: Story = { args: { view: "no-results" } };
export const CombinedFilters: Story = { args: { view: "red-bh-all-risk" } };
export const NoFilterResults: Story = { args: { view: "red-msk-all-risk" } };
export const NameOrder: Story = { args: { view: "name" } };
export const OldestFirst: Story = { args: { view: "recency" } };
export const RiskUnavailable: Story = { args: { view: "no-risk" } };
export const Loading: Story = { args: { view: "loading" } };
export const LoadError: Story = { args: { view: "error" } };
export const EmptyCohort: Story = { args: { view: "empty" } };
export const RefreshFailed: Story = { args: { view: "stale" } };
