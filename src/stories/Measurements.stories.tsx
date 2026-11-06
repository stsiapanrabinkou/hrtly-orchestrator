import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { MetricCard } from "@/shared/ui/orchestrator/MeasurementCard";
import { patients } from "@/flows/_mocks/orchestrator";
import { ThemeProvider } from "@/theme/ThemeProvider";

const meta = {
  title: "Orchestrator/Measurements",
  component: MetricCard,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-svh bg-background p-5 text-foreground">
          <div className="max-w-2xl">
            <Story />
          </div>
        </div>
      </ThemeProvider>
    ),
  ],
  args: {
    metric: patients[1].metrics[0],
    patientName: patients[1].name,
    patientId: patients[1].displayId,
  },
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BloodPressure: Story = {};
export const Laboratory: Story = { args: { metric: patients[1].metrics[1] } };
export const BehavioralHealth: Story = {
  args: {
    metric: patients[2].metrics[0],
    patientName: patients[2].name,
    patientId: patients[2].displayId,
  },
};
export const PainScore: Story = {
  args: {
    metric: patients[6].metrics[0],
    patientName: patients[6].name,
    patientId: patients[6].displayId,
  },
};
export const SingleMeasurement: Story = {
  args: {
    metric: {
      ...patients[1].metrics[0],
      readings: patients[1].metrics[0].readings?.slice(-1),
    },
  },
};
export const NoMeasurements: Story = {
  args: {
    metric: patients[7].metrics[0],
    patientName: patients[7].name,
    patientId: patients[7].displayId,
  },
};
