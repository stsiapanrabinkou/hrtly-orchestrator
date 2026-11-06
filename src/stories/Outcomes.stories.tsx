import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { OutcomesView } from "@/shared/ui/orchestrator/OutcomesView";
const meta = { title: "Orchestrator/Outcomes", component: OutcomesView, parameters: { layout: "fullscreen" }, args: { appBase: "http://localhost:5173" }, render: (args) => <OutcomesView key={JSON.stringify(args)} {...args} /> } satisfies Meta<typeof OutcomesView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { items: [], cohorts: [] } };
