import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { EnrollmentView } from "@/shared/ui/orchestrator/EnrollmentView";
const meta = { title: "Orchestrator/Enrollment", component: EnrollmentView, parameters: { layout: "fullscreen" }, args: { appBase: "http://localhost:5173" }, render: (args) => <EnrollmentView key={JSON.stringify(args)} {...args} /> } satisfies Meta<typeof EnrollmentView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const InvitationFailure: Story = { args: { invitationOutcome: "failure" } };
