import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { PatientsListView } from "@/shared/ui/orchestrator/PatientsListView";
const meta = { title: "Orchestrator/Patients", component: PatientsListView, parameters: { layout: "fullscreen" }, args: { appBase: "http://localhost:5173" }, render: (args) => <PatientsListView key={JSON.stringify(args)} {...args} /> } satisfies Meta<typeof PatientsListView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { items: [] } };
