// src/flows/_devbar/flatten.ts
//
// Turns the nested designer route tree into a flat, navigable list.
// Shared by DevBar and the Flow Map story so the two can never disagree
// about what screens exist.
//
// Pure data. No fetching, no state, no guards — stays inside Design Mode.

import { routes as defaultRoutes, type FlowRoute } from "../routes";

export type FlatRoute = {
  /** Full path, e.g. "/loans/:id" */
  path: string;
  role: string;
  flow: string;
  label: string;
  samples?: Record<string, string>;
};

/** Flatten the tree into every routable (component-bearing) screen. */
export function flattenRoutes(nodes: FlowRoute[] = defaultRoutes, parent = ""): FlatRoute[] {
  return nodes.flatMap((node) => {
    const full = `${parent}/${node.path}`.replace(/\/+/g, "/");
    const self: FlatRoute[] = node.component
      ? [{
          path: full,
          role: node.meta?.role ?? "unassigned",
          flow: node.meta?.flow ?? "General",
          label: node.meta?.label ?? (node.path.replace(/^\//, "") || "index"),
          samples: node.meta?.sampleParams,
        }]
      : [];
    return [...self, ...flattenRoutes(node.children ?? [], full)];
  });
}

/**
 * Swap :params for a sample value so detail screens are actually clickable.
 * Sample comes from route meta.sampleParams, else falls back to "1".
 */
export function resolvePath(path: string, samples?: Record<string, string>) {
  return path.replace(/:(\w+)/g, (_, key: string) => samples?.[key] ?? "1");
}

/** Group screens by their `flow` label, preserving declaration order. */
export function groupByFlow(items: FlatRoute[]): Array<[string, FlatRoute[]]> {
  const byFlow = items.reduce<Record<string, FlatRoute[]>>((acc, r) => {
    (acc[r.flow] ??= []).push(r);
    return acc;
  }, {});
  return Object.entries(byFlow);
}
