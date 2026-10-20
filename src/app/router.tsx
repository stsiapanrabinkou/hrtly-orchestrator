// src/app/router.tsx
//
// DEV-OWNED. The router INSTANCE plus the bridge that consumes the designer's
// route tree from /flows.
//
// This file is created ONCE, at init, already generic. That matters: if init
// hardcodes an index route instead, the designer's very first flow forces an
// /app edit — a dev-mode commit for what should be pure design work. The bridge
// below reads whatever is in flows/routes.tsx, so from here on adding a screen
// is: drop a component in src/flows/<name>/, add an entry to routes.tsx. Done.
//
// This is the router SHELL. Loaders, guards, redirects, code-splitting and
// providers get attached HERE during integration — never in /flows.

import type { ComponentType } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  type AnyRoute,
  type RouteComponent,
} from "@tanstack/react-router";
import { ThemeProvider } from "../theme/ThemeProvider";
import DevBar from "../flows/_devbar/DevBar";
import { routes, type FlowRoute } from "../flows/routes";

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      {/* Self-disables in production builds. Mounted once, here, so that
          designers never have a reason to open /app. */}
      <DevBar />
      <Outlet />
    </ThemeProvider>
  ),
});

/**
 * Designers write ":id" because it's readable and it's what the DevBar and Flow
 * Map render. TanStack Router wants "$id". Translating here is exactly the kind
 * of plumbing that belongs on the dev side of the seam.
 */
const toRouterPath = (p: string) => p.replace(/:(\w+)/g, "$$$1");

/**
 * Designers type screens as React's `ComponentType`, which is the type they
 * already know and which includes class components. TanStack's
 * `RouteComponent` is function-components-only, so assigning one to the other
 * is two TS2322 errors — and since `npm run build` is `tsc -b && vite build`,
 * they break the production build while `npm run dev` stays perfectly happy.
 *
 * Absorbing that mismatch here keeps `flows/routes.tsx` in plain React types.
 * The cast is safe in practice: every screen in /flows is a function component,
 * and a class component would still render — TanStack just doesn't type for it.
 */
const toRouteComponent = (c: ComponentType): RouteComponent => c as RouteComponent;

/**
 * Recursively convert FlowRoute[] -> TanStack routes.
 *
 * A node with children becomes a pathless layout and its own `component` is
 * hung as that layout's index route. Without this, a parent screen that lacks
 * an <Outlet/> would silently swallow its children — a footgun designers would
 * hit on their first master/detail flow and have no way to debug.
 */
function build(nodes: FlowRoute[], parent: AnyRoute): AnyRoute[] {
  return nodes.map((node) => {
    const kids = node.children ?? [];

    if (kids.length === 0) {
      return createRoute({
        getParentRoute: () => parent,
        path: toRouterPath(node.path),
        component: node.component ? toRouteComponent(node.component) : Outlet,
      }) as AnyRoute;
    }

    const layout = createRoute({
      getParentRoute: () => parent,
      path: toRouterPath(node.path),
      component: Outlet,
    }) as AnyRoute;

    const children = build(kids, layout);

    if (node.component) {
      children.unshift(
        createRoute({
          getParentRoute: () => layout,
          path: "/",
          component: toRouteComponent(node.component),
        }) as AnyRoute
      );
    }

    return layout.addChildren(children);
  });
}

const routeTree = rootRoute.addChildren(build(routes, rootRoute));

export const router = createRouter({ routeTree });

// Deliberately NO `declare module "@tanstack/react-router" { interface Register }`.
// The tree is assembled at runtime from /flows, so TypeScript cannot infer
// literal route paths — registering it would type `to` as a union that doesn't
// include the designer's routes and break every navigate() call. Loose `to`
// typing is the honest trade for a designer-editable route tree.
