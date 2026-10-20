import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { HeaderControls } from "@/shared/ui/orchestrator/HeaderControls";
import { ThemeProvider } from "@/theme/ThemeProvider";
const meta = {
  title: "Orchestrator/Header controls",
  component: HeaderControls,
  decorators: [(Story) => <ThemeProvider><div className="flex min-h-96 justify-end bg-background p-4 text-foreground"><div><Story /></div></div></ThemeProvider>],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HeaderControls>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Interactive: Story = {};
