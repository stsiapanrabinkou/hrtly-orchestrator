import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { RecommendationsListView } from "@/shared/ui/orchestrator/RecommendationsListView";
const meta = { title: "Orchestrator/Recommendations queue", component: RecommendationsListView, parameters: { layout: "fullscreen" }, args: { appBase: "http://localhost:5173" }, render: (args) => <RecommendationsListView key={JSON.stringify(args)} {...args} /> } satisfies Meta<typeof RecommendationsListView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { state: "loading" } };
export const Error: Story = { args: { state: "error" } };
export const Empty: Story = { args: { items: [] } };
