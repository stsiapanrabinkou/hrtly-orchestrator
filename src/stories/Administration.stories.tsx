import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AdministrationView } from "@/shared/ui/orchestrator/AdministrationView";
const meta = { title: "Orchestrator/Administration", component: AdministrationView, parameters: { layout: "fullscreen" }, args: { appBase: "http://localhost:5173" }, render: (args) => <AdministrationView key={JSON.stringify(args)} {...args} /> } satisfies Meta<typeof AdministrationView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { users: [] } };
