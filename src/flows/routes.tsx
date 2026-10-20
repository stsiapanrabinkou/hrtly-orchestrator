// src/flows/routes.tsx
//
// DESIGNER-OWNED. The declarative route tree: structure and navigation only.
// There is deliberately no `loader` or `guard` field — there's nowhere to put
// logic, which is what keeps this folder safe to own.
//
// /app/router.tsx consumes this tree generically and builds the real router
// from it. Adding a screen = drop a component in src/flows/<name>/ and add an
// entry here. You never touch /app.
//
// Param syntax is `:id` (readable). The bridge in /app translates it to
// TanStack's `$id` — don't write `$id` here.

import type { ComponentType } from "react";
import WorkspaceScreen from "./workspace/WorkspaceScreen";
import MonitoringScreen from "./monitoring/MonitoringScreen";
import PatientScreen from "./patients/PatientScreen";
import RecommendationScreen from "./recommendations/RecommendationScreen";

export type FlowRoute = {
  /** "/" | "loans" | ":id". Nested under the parent's path. */
  path: string;
  /** The screen. Omit on a node that exists purely to group children. */
  component?: ComponentType;
  children?: FlowRoute[];
  /**
   * Design annotation ONLY — grouping/labels for the DevBar and the Flow Map.
   * NOT enforcement: `meta.role: "admin"` restricts nothing.
   * Real role guards are dev's, in /app.
   */
  meta?: {
    role?: string;
    flow?: string;
    label?: string;
    /** Sample values so detail routes are clickable, e.g. { id: "1001" }. */
    sampleParams?: Record<string, string>;
  };
};

export const routes: FlowRoute[] = [
  {
    path: ":section",
    component: WorkspaceScreen,
    meta: {
      role: "clinician",
      flow: "Workspace navigation",
      label: "Planned sections",
      sampleParams: { section: "patients" },
    },
  },
  {
    path: "/",
    component: MonitoringScreen,
    meta: { role: "clinician", flow: "Monitoring", label: "All patients" },
  },
  {
    path: "monitoring/:view",
    component: MonitoringScreen,
    meta: {
      role: "clinician",
      flow: "Monitoring",
      label: "Prepared monitoring view",
      sampleParams: { view: "gap" },
    },
  },
  {
    path: "patients/:id/from/:view",
    component: PatientScreen,
    meta: {
      role: "clinician",
      flow: "Patient review",
      label: "Patient overview",
      sampleParams: { id: "d1000000-0000-4000-8000-000000001002", view: "gap" },
    },
  },
  {
    path: "patients/:id/from/:view/recommendations/:recommendationId",
    component: RecommendationScreen,
    meta: {
      role: "clinician",
      flow: "Patient review",
      label: "Recommendation",
      sampleParams: {
        id: "d1000000-0000-4000-8000-000000001002",
        view: "gap",
        recommendationId: "outreach-1002",
      },
    },
  },
  {
    path: "patients/:id/from/:view/recommendations/:recommendationId/preview/:decision",
    component: RecommendationScreen,
    meta: {
      role: "clinician",
      flow: "Decision previews",
      label: "Decision preview",
      sampleParams: {
        id: "d1000000-0000-4000-8000-000000001002",
        view: "gap",
        recommendationId: "outreach-1002",
        decision: "accepted",
      },
    },
  },
];
