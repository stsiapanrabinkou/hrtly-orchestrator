import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { PatientView } from "@/shared/ui/orchestrator/PatientView";
import { patients } from "@/flows/_mocks/orchestrator";
import { patientRecords } from "@/flows/_mocks/patient-records";
const meta = {
  title: "Orchestrator/Patient overview",
  component: PatientView,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <PatientView
      key={`${args.patient?.id}-${args.initialTab}-${args.referralPreviewOutcome}-${args.messagePreviewOutcome}`}
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
export const RedAlert: Story = { name: "Critical alert", args: { patient: patients[0] } };
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
export const CarePlanFirstSend: Story = {
  args: {
    initialTab: "care",
    record: {
      ...patientRecords[1],
      carePlanUpdate: { lastSentAt: null, lastSentPlan: null },
    },
  },
};
export const CarePlanNoChanges: Story = {
  args: {
    initialTab: "care",
    record: {
      ...patientRecords[1],
      carePlanUpdate: {
        lastSentAt: "Oct 19, 2026",
        lastSentPlan: {
          goals: patientRecords[1].goals,
          activities: patientRecords[1].activities,
          team: patientRecords[1].team,
        },
      },
    },
  },
};
export const ProfileAndSocialNeeds: Story = { args: { initialTab: "profile" } };
export const ProfileMultipleTracks: Story = { args: { initialTab: "profile", patient: patients[4] } };
export const ProfileMissingDetails: Story = { args: { initialTab: "profile", patient: patients[7] } };
export const ProfileLongEntries: Story = {
  args: {
    initialTab: "profile",
    record: {
      ...patientRecords[1],
      profile: { ...patientRecords[1].profile, address: "120 West 24th Street, Apartment 1204, Building B, New York, NY 10001" },
      caregivers: [
        ...patientRecords[1].caregivers,
        { name: "Michael Reed", relationship: "Son · family member", permissions: "View appointment reminders and care plan updates" },
      ],
    },
  },
};
export const EscalationLog: Story = { args: { initialTab: "escalations" } };
export const EscalationsCritical: Story = { args: { initialTab: "escalations", patient: patients[0] } };
export const EscalationsEmpty: Story = { args: { initialTab: "escalations", patient: patients[5] } };
export const EscalationsMultiple: Story = {
  args: {
    initialTab: "escalations",
    patient: patients[0],
    record: {
      ...patientRecords[0],
      escalations: [
        {
          ...patientRecords[0].escalations[0],
          id: "alert-P-1001-earlier",
          date: "Oct 17, 2026 · 09:00 UTC",
          timestamp: Date.parse("2026-10-17T09:00:00Z"),
          severity: "yellow",
          title: "Earlier alert requires review",
          note: "Review arranged with the assigned care team.",
          noteDate: "Oct 17, 2026 · 09:00 UTC",
        },
        ...patientRecords[0].escalations,
      ],
    },
  },
};
export const EscalationsMissingNote: Story = {
  args: {
    initialTab: "escalations",
    record: {
      ...patientRecords[1],
      escalations: patientRecords[1].escalations.map((alert) => ({ ...alert, note: "", author: "Not recorded", noteDate: null, delivery: "Notification details not recorded." })),
    },
  },
};
export const MessagesAndRecommendations: Story = {
  args: { initialTab: "communications" },
};
export const CommunicationsEmpty: Story = {
  args: { initialTab: "communications", patient: patients[7] },
};
export const MessageSendFailure: Story = {
  args: { initialTab: "communications", messagePreviewOutcome: "failure" },
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
