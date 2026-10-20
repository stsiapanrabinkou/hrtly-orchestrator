// src/stories/ThemeShowcase.stories.tsx
//
// The designer's reference sheet: every semantic token and the components that
// consume them, rendered in light and dark side by side.
//
// This story is also the pack's own regression test. Every swatch below is a
// STATIC utility class — bg-primary, text-muted-foreground — so if someone
// edits src/theme/theme.css and a swatch doesn't move, the theme is not wired
// through @theme inline. And if a screen elsewhere doesn't move with it,
// someone bypassed the theme and the lint rules should have caught them.
//
// Note what is NOT here: a hex value, a style prop, a raw palette utility.
// This file is linted with the same AUTHORED tier as /flows.

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Heading, Text } from "@/shared/ui/typography";
import { ThemeProvider, type ThemeMode } from "@/theme/ThemeProvider";

/**
 * Every colour token defined in theme.css, paired with the class that reads it.
 *
 * Hardcoded as a list rather than derived from the CSS: reading custom
 * properties back out of the DOM would show what the browser computed, not
 * whether Tailwind actually emitted a utility for it — which is the thing that
 * silently breaks when @theme inline is edited.
 */
const SURFACES: Array<{ token: string; box: string; text?: string }> = [
  { token: "danger", box: "bg-danger-soft border", text: "text-danger" },
  { token: "warning", box: "bg-warning-soft border", text: "text-warning" },
  { token: "success", box: "bg-success-soft border", text: "text-success" },
  { token: "background", box: "bg-background border", text: "text-foreground" },
  { token: "card", box: "bg-card border", text: "text-card-foreground" },
  { token: "popover", box: "bg-popover border", text: "text-popover-foreground" },
  { token: "primary", box: "bg-primary", text: "text-primary-foreground" },
  { token: "secondary", box: "bg-secondary", text: "text-secondary-foreground" },
  { token: "muted", box: "bg-muted", text: "text-muted-foreground" },
  { token: "accent", box: "bg-accent", text: "text-accent-foreground" },
  { token: "destructive", box: "bg-destructive", text: "text-destructive-foreground" },
];

const LINES: Array<{ token: string; box: string }> = [
  { token: "border", box: "bg-border" },
  { token: "input", box: "bg-input" },
  { token: "ring", box: "bg-ring" },
];

const CHARTS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

const RADII: Array<{ label: string; cls: string }> = [
  { label: "sm", cls: "rounded-sm" },
  { label: "md", cls: "rounded-md" },
  { label: "lg", cls: "rounded-lg" },
  { label: "xl", cls: "rounded-xl" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Showcase() {
  return (
    <div className="min-h-svh bg-background p-6 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-1">
          <Heading level={1}>Theme showcase</Heading>
          <Text variant="muted">
            Everything here reads from src/theme/theme.css and src/shared/ui/typography.tsx.
            Edit either and this page moves.
          </Text>
        </div>

        <Section title="Surfaces">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SURFACES.map(({ token, box, text }) => (
              <div key={token} className={`rounded-lg p-4 ${box}`}>
                <div className={`text-xs font-medium ${text ?? ""}`}>{token}</div>
                <div className={`mt-1 font-mono text-[10px] opacity-70 ${text ?? ""}`}>
                  --{token}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Lines & focus">
          <div className="flex gap-3">
            {LINES.map(({ token, box }) => (
              <div key={token} className="flex-1 space-y-1">
                <div className={`h-8 rounded-md ${box}`} />
                <div className="font-mono text-[10px] text-muted-foreground">--{token}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Chart series">
          <div className="flex gap-2">
            {CHARTS.map((cls, i) => (
              <div key={cls} className="flex-1 space-y-1">
                <div className={`h-10 rounded-md ${cls}`} />
                <div className="font-mono text-[10px] text-muted-foreground">chart-{i + 1}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius">
          <div className="flex gap-3">
            {RADII.map(({ label, cls }) => (
              <div key={label} className="space-y-1">
                <div className={`size-14 bg-secondary ${cls}`} />
                <div className="font-mono text-[10px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </Section>

        <Separator />

        <Section title="Type scale">
          <div className="space-y-3">
            {([1, 2, 3, 4] as const).map((level) => (
              <div key={level} className="flex items-baseline gap-4">
                <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
                  level {level}
                </span>
                <Heading level={level}>The quick brown fox</Heading>
              </div>
            ))}
            {(["body", "lead", "small", "muted", "mono"] as const).map((variant) => (
              <div key={variant} className="flex items-baseline gap-4">
                <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
                  {variant}
                </span>
                <Text variant={variant}>The quick brown fox</Text>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-2">
            {(["default", "secondary", "outline", "ghost", "link", "destructive"] as const).map(
              (v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              )
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["sm", "default", "lg"] as const).map((s) => (
              <Button key={s} size={s}>
                size {s}
              </Button>
            ))}
            <Button disabled>disabled</Button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            {(["default", "secondary", "outline", "destructive"] as const).map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Form controls">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="showcase-email">Email</Label>
                <Input id="showcase-email" placeholder="designer@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="showcase-note">Note</Label>
                <Textarea id="showcase-note" placeholder="Mock content only." />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="showcase-check" defaultChecked />
                <Label htmlFor="showcase-check">Checkbox</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="showcase-switch" defaultChecked />
                <Label htmlFor="showcase-switch">Switch</Label>
              </div>
              <Progress value={62} />
            </CardContent>
          </Card>
        </Section>

        <Section title="Card & skeleton">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <h4 className="font-medium">Card</h4>
                <p className="text-sm text-muted-foreground">bg-card / text-card-foreground</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Body copy sits on the card surface.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-2 pt-6">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

/** Storybook has no router, so nothing here may navigate. Pure presentation. */
const meta: Meta<typeof Showcase> = {
  title: "System/Theme Showcase",
  component: Showcase,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof Showcase>;

/**
 * forcedMode rather than the global toggle: two stories that each pin a mode
 * can be opened side by side, which is how you actually catch a token that
 * only works in light.
 */
const withMode = (mode: ThemeMode): Story => ({
  render: () => (
    <ThemeProvider forcedMode={mode}>
      <Showcase />
    </ThemeProvider>
  ),
});

export const Light = withMode("light");
export const Dark = withMode("dark");
