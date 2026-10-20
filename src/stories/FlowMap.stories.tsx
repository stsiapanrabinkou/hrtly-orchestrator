// src/stories/FlowMap.stories.tsx
//
// The Flow Map the DevBar links to. The story ID is load-bearing:
//   title "System/Flow Map" + export `AllFlows` -> system-flow-map--all-flows
// which is exactly the URL in src/flows/_devbar/DevBar.tsx. Rename either side
// and the DevBar's "Flow map" button 404s. scope-guard.yml asserts both halves.
//
// Reads the designer's route tree and renders every screen, grouped by flow,
// filterable by role, with a click-through into the running app. Pure data —
// no fetching, no state, no guards.
//
// The screen list is a <Table>, not hand-rolled divs: <table> is a lint error
// in this tier, which is exactly the rule doing its job.

import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { ExternalLink, Network } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { flattenRoutes, groupByFlow, resolvePath } from "@/flows/_devbar/flatten";

// Where `npm run dev` serves the app. Matches vite's default.
const APP_URL = "http://localhost:5173";

function FlowMap() {
  const [role, setRole] = useState<string>("all");

  const all = useMemo(() => flattenRoutes(), []);
  const roles = useMemo(
    () => ["all", ...Array.from(new Set(all.map((r) => r.role)))],
    [all]
  );

  const visible = role === "all" ? all : all.filter((r) => r.role === role);
  const groups = groupByFlow(visible);

  return (
    <div className="min-h-svh bg-background p-6 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
              <Network className="size-5 text-muted-foreground" />
              Flow map
            </h2>
            <p className="text-sm text-muted-foreground">
              Every screen declared in src/flows/routes.tsx, grouped by flow.
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 font-mono">
            {all.length} {all.length === 1 ? "screen" : "screens"}
          </Badge>
        </div>

        <Tabs value={role} onValueChange={setRole}>
          <TabsList>
            {roles.map((r) => (
              <TabsTrigger key={r} value={r} className="capitalize">
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {groups.length === 0 ? (
          <Alert>
            <AlertTitle>No screens yet</AlertTitle>
            <AlertDescription>
              Add an entry to src/flows/routes.tsx and it will appear here automatically.
            </AlertDescription>
          </Alert>
        ) : (
          groups.map(([flow, items]) => (
            <Card key={flow}>
              <CardHeader>
                <h3 className="font-medium tracking-tight">{flow}</h3>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Screen</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((r) => (
                      <TableRow key={r.path}>
                        <TableCell className="font-medium">{r.label}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {r.path}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {r.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Storybook has no router — this is a plain link into
                              the dev server, not navigation. */}
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={`${APP_URL}${resolvePath(r.path, r.samples)}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof FlowMap> = {
  title: "System/Flow Map",
  component: FlowMap,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof FlowMap>;

/** Export name is load-bearing — see the header comment. */
export const AllFlows: Story = {
  render: () => (
    <ThemeProvider>
      <FlowMap />
    </ThemeProvider>
  ),
};
