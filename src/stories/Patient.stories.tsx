import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patients } from "@/flows/_mocks/orchestrator";
const meta = {
  title: "Orchestrator/Patient overview",
  component: PatientView,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <PatientView
      key={`${args.patient?.id}-${args.initialTab}-${args.referralPreviewOutcome}`}
      {...args}
    />
  ),
  args: {
    appBase: "http://localhost:5173",
    patient: patients[1],
    returnView: "gap",
  },
} satisfies Meta<typeof PatientView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const MonitoringGap: Story = {};
export const LineTabsPreview: Story = { args: { tabsAppearance: "line" } };
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
export const ClinicalTimeline: Story = { args: { initialTab: "timeline" } };
export const CarePlan: Story = { args: { initialTab: "care" } };
export const ProfileAndSocialNeeds: Story = { args: { initialTab: "profile" } };
export const EscalationLog: Story = { args: { initialTab: "escalations" } };
export const MessagesAndRecommendations: Story = {
  args: { initialTab: "communications" },
};
export const EmptyRecord: Story = {
  args: { patient: patients[7], initialTab: "care" },
};
export const ReferralSubmissionFailure: Story = {
  args: { initialTab: "profile", referralPreviewOutcome: "failure" },
};
export const AdditionalPatient: Story = {
  args: { patient: patients[8], initialTab: "profile" },
};
