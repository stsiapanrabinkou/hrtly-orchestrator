import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { RecommendationView } from "@/shared/ui/orchestrator/RecommendationView";
const meta = {
  title: "Orchestrator/Recommendation",
  component: RecommendationView,
  parameters: { layout: "fullscreen" },
  args: { appBase: "http://localhost:5173", returnView: "gap" },
} satisfies Meta<typeof RecommendationView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PendingReview: Story = {};
export const Accepted: Story = { args: { initialDecision: "accepted" } };
export const ModifiedAndAccepted: Story = {
  args: { initialDecision: "modified" },
};
export const Dismissed: Story = { args: { initialDecision: "dismissed" } };
export const Loading: Story = { args: { state: "loading" } };
export const LoadError: Story = { args: { state: "error" } };
export const RecommendationUnavailable: Story = {
  args: { state: "not-found" },
};
