import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { WorkspacePreview } from "@/shared/ui/orchestrator/WorkspacePreview";
import { workspaceNavigation } from "@/flows/_mocks/navigation";
const meta = {
  title: "Orchestrator/Workspace navigation",
  component: WorkspacePreview,
  parameters: { layout: "fullscreen" },
  args: { appBase: "http://localhost:5173" },
} satisfies Meta<typeof WorkspacePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Patients: Story = { args: { item: workspaceNavigation[1] } };
export const Recommendations: Story = {
  args: { item: workspaceNavigation[2] },
};
export const Messages: Story = { args: { item: workspaceNavigation[3] } };
export const Outcomes: Story = { args: { item: workspaceNavigation[4] } };
