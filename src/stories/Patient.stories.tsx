import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patients } from "@/flows/_mocks/orchestrator";
const meta = {
  title: "Orchestrator/Patient overview",
  component: PatientView,
  parameters: { layout: "fullscreen" },
  args: {
    appBase: "http://localhost:5173",
    patient: patients[1],
    returnView: "gap",
  },
} satisfies Meta<typeof PatientView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MonitoringGap: Story = {};
export const RedAlert: Story = { args: { patient: patients[0] } };
export const BehavioralHealth: Story = { args: { patient: patients[2] } };
export const MultipleTracks: Story = { args: { patient: patients[4] } };
export const GapWithoutAlert: Story = { args: { patient: patients[5] } };
export const Musculoskeletal: Story = { args: { patient: patients[6] } };
export const BaselineAndMeasurementsMissing: Story = {
  args: { patient: patients[7] },
};
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = { args: { state: "error" } };
export const PatientUnavailable: Story = { args: { state: "not-found" } };
