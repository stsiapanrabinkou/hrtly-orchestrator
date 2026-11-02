import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dropdownStyles } from "@/shared/ui/dropdown-styles";
import { Heading, Text } from "@/shared/ui/typography";
import { ThemeProvider } from "@/theme/ThemeProvider";

function DropdownExamples() {
  const [alert, setAlert] = useState("All alerts");
  const [tracks, setTracks] = useState<string[]>(["CKM"]);
  const [action, setAction] = useState("");
  return (
    <ThemeProvider>
      <div className="min-h-svh bg-background p-8 text-foreground">
        <Heading level={1}>Dropdowns</Heading>
        <Text variant="muted" className="mt-2">
          40 px fields and menu items · 14 px text · 12 px horizontal padding ·
          8 px popup offset
        </Text>
        <div className="mt-8 grid max-w-4xl items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="dropdown-single">Single selection</Label>
            <Select value={alert} onValueChange={setAlert}>
              <SelectTrigger id="dropdown-single" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["All alerts", "Red flag", "Yellow flag", "No alerts"].map(
                  (value) => (
                    <SelectItem value={value} key={value}>
                      {value}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropdown-multiple">Multiple selection</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="dropdown-multiple"
                  variant="outline"
                  className={`${dropdownStyles.trigger} w-full`}
                >
                  <span className="truncate">
                    {tracks.join(", ") || "All tracks"}
                  </span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {["CKM", "eCKM", "BH", "MSK"].map((track) => (
                  <DropdownMenuCheckboxItem
                    key={track}
                    checked={tracks.includes(track)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) =>
                      setTracks((current) =>
                        checked
                          ? [...current, track]
                          : current.filter((value) => value !== track),
                      )
                    }
                  >
                    {track}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropdown-disabled">Disabled</Label>
            <Select disabled>
              <SelectTrigger id="dropdown-disabled" className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not available</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropdown-actions">Actions</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="dropdown-actions"
                  variant="outline"
                  className={`${dropdownStyles.trigger} w-full`}
                >
                  Actions
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => setAction("View profile selected")}
                >
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setAction("Preferences selected")}
                >
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuItem disabled>Unavailable action</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {action && (
          <Text role="status" className="mt-6">
            {action}
          </Text>
        )}
      </div>
    </ThemeProvider>
  );
}

const meta = {
  title: "System/Dropdowns",
  component: DropdownExamples,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DropdownExamples>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Unified: Story = {};
