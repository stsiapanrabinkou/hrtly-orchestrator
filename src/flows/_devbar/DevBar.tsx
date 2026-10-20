// src/flows/_devbar/DevBar.tsx
//
// Designer's dev-only nav bar (think: WordPress admin bar).
//
// Renders ONLY in development. `import.meta.env.DEV` is statically replaced at
// build time, so the prod branch collapses to `return null` and DevBarPanel —
// along with everything it imports — is tree-shaken out of production bundles.
// The scope-guard workflow greps the built bundle to prove this, rather than
// asserting it in a comment.
//
// Note the two-component split: the DEV check has to sit in a component with NO
// hooks, otherwise it's a conditional early-return above useState/useTheme and
// react-hooks flags it (correctly).
//
// It reads src/flows/routes.tsx (plain data — no loaders/guards) and builds a
// jump-to-any-screen switcher. Nothing here fetches, stores, or guards.
//
// There is no DevBar.styles.ts. In the antd/MUI/Carbon packs styling lived in a
// co-located style-object file; here `style` is a lint error and every one of
// those values is a Tailwind utility instead.

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { BookOpen, EyeOff, Moon, Network, Sun, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/theme/ThemeProvider";
import { flattenRoutes, groupByFlow, resolvePath } from "./flatten";

// Where Storybook runs locally (see the `dev` script in package.json).
const STORYBOOK_URL = "http://localhost:6006";
const FLOWMAP_URL = `${STORYBOOK_URL}/?path=/story/system-flow-map--all-flows`;

/** Dev gate only. No hooks in here — that's the whole point of the split. */
export function DevBar() {
  if (!import.meta.env.DEV) return null;
  return <DevBarPanel />;
}

function DevBarPanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { mode, toggle } = useTheme();
  const [role, setRole] = useState<string>("all");
  const [hidden, setHidden] = useState(false);

  /**
   * Publish the bar's height so the app's own chrome can get out of its way.
   *
   * The spacer at the bottom of this component pushes NORMAL flow content down,
   * but it does nothing for an app shell whose header is itself `fixed` or
   * `sticky top-0` — that header slides underneath the DevBar and its nav stops
   * being clickable. That happened on a real project built from this pack.
   *
   * So any fixed or sticky chrome should anchor to this variable:
   *
   *   <header className="sticky top-(--devbar-height) ...">
   *
   * theme.css declares `--devbar-height: 0px` as the default, so the same
   * markup is correct in production and in Storybook, where this never mounts.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--devbar-height", hidden ? "0px" : "3rem");
    return () => root.style.setProperty("--devbar-height", "0px");
  }, [hidden]);

  const all = useMemo(() => flattenRoutes(), []);
  const roles = useMemo(
    () => ["all", ...Array.from(new Set(all.map((r) => r.role)))],
    [all],
  );

  const groups = useMemo(() => {
    const visible = role === "all" ? all : all.filter((r) => r.role === role);
    return groupByFlow(visible);
  }, [all, role]);

  if (hidden) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setHidden(false)}
        className="fixed bottom-3 left-3 z-[9999] gap-1.5 shadow-md"
      >
        <Zap />
        Dev
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      {/* z-[9999] is an arbitrary SIZE, not an arbitrary colour — legal, and
          necessary because shadcn overlays sit at z-50. */}
      <div className="fixed inset-x-0 top-0 z-[9999] border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-12 w-full max-w-[1600px] items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge
              variant="secondary"
              className="shrink-0 font-mono text-[10px] tracking-wider"
            >
              DEV
            </Badge>

            <ToggleGroup
              type="single"
              value={role}
              onValueChange={(next) => {
                if (next) setRole(next);
              }}
              aria-label="Filter screens by role"
              className="hidden gap-0 rounded-lg bg-muted p-0.5 sm:flex"
            >
              {roles.map((r) => (
                <ToggleGroupItem
                  key={r}
                  value={r}
                  className="h-6 min-w-0 px-2 text-xs capitalize text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-foreground"
                >
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* value={undefined} keeps the placeholder showing after a jump, so
                the control reads as an action rather than as current state. */}
            <Select
              value={undefined}
              onValueChange={(path) => {
                const match = all.find((r) => r.path === path);
                // Dynamic route tree => `to` is not literal-typed. Intentional.
                navigate({ to: resolvePath(path, match?.samples) });
              }}
            >
              <SelectTrigger
                size="sm"
                aria-label="Jump to screen"
                className="w-36 min-w-0 shrink sm:w-[280px]"
              >
                <SelectValue placeholder="Jump to screen…" />
              </SelectTrigger>
              <SelectContent className="z-[10000] max-w-[calc(100vw-1rem)]">
                {groups.length === 0 ? (
                  <div className="px-2 py-6 text-center text-xs text-muted-foreground">
                    No screens yet — add one to src/flows/routes.tsx
                  </div>
                ) : (
                  groups.map(([flow, items]) => (
                    <SelectGroup key={flow}>
                      <SelectLabel>{flow}</SelectLabel>
                      {items.map((r) => (
                        <SelectItem key={r.path} value={r.path}>
                          {r.label}
                          <span className="ml-2 hidden max-w-64 truncate font-mono text-xs text-muted-foreground sm:inline">
                            {r.path}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))
                )}
              </SelectContent>
            </Select>

            <span className="hidden truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
              {pathname}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                  <a
                    aria-label="Open Flow map"
                    href={FLOWMAP_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Network />
                    <span className="hidden sm:inline">Flow map</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>How all screens connect</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1.5" asChild>
                  <a
                    aria-label="Open Storybook"
                    href={STORYBOOK_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BookOpen />
                    <span className="hidden sm:inline">Storybook</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Components &amp; every screen state
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggle}
                  aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
                >
                  {mode === "dark" ? <Sun /> : <Moon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Switch to {mode === "dark" ? "light" : "dark"} theme
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setHidden(true)}
                  aria-label="Hide developer bar"
                >
                  <EyeOff />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hide bar</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      {/* Pushes normal flow content down. Fixed/sticky chrome must use
          top-(--devbar-height) instead — a spacer cannot move it. */}
      <div className="h-(--devbar-height)" />
    </TooltipProvider>
  );
}

export default DevBar;
