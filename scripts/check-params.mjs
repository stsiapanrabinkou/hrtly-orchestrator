// scripts/check-params.mjs
//
// Fails if a route whose path contains a `:param` points at a component that
// never calls useParams.
//
// Why this exists: a detail screen at `transactions/:id` that renders one
// hardcoded record looks completely finished in review. It clicks through from
// the list, it shows a transaction, nobody notices until integration that the
// URL is ignored. That shipped on the first project built from this pack.
//
// Deliberately a text scan, not a type-aware pass. It reads flows/routes.tsx,
// finds every `path: ":something"` entry, resolves the component named on that
// node back to its import, and greps that file for `useParams`. That is enough
// to catch the real mistake and cheap enough to run on every PR.

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROUTES = "src/flows/routes.tsx";

if (!existsSync(ROUTES)) {
  console.log("✓ param check skipped (no flows/routes.tsx yet)");
  process.exit(0);
}

const src = readFileSync(ROUTES, "utf8");

// Strip comments first. The file ships with a commented-out example block
// containing `path: ":id"`, and flagging the designer's own template would
// make this check noise on day one.
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n")
  .filter((l) => !l.trim().startsWith("//"))
  .join("\n");

/** import Foo from "./x/Foo"  ->  { Foo: "./x/Foo" } */
const imports = Object.fromEntries(
  [...code.matchAll(/import\s+(\w+)\s+from\s+["']([^"']+)["']/g)].map((m) => [m[1], m[2]])
);

// Each `{ ... }` route node that has BOTH a param path and a component.
const offenders = [];
for (const node of code.matchAll(/\{[^{}]*\}/g)) {
  const body = node[0];
  const path = body.match(/path:\s*["']([^"']*)["']/);
  const comp = body.match(/component:\s*(\w+)/);
  if (!path || !comp) continue;
  if (!path[1].includes(":")) continue;

  const spec = imports[comp[1]];
  if (!spec) continue; // defined inline; nothing to read

  const base = resolve(dirname(ROUTES), spec);
  const file = [".tsx", ".ts", "/index.tsx", "/index.ts"]
    .map((ext) => base + ext)
    .find(existsSync);

  if (!file) continue; // unresolvable; tsc is the right tool to complain
  if (!readFileSync(file, "utf8").includes("useParams")) {
    offenders.push({ path: path[1], component: comp[1], file });
  }
}

if (offenders.length) {
  console.error(
    "\n\u2716 These routes take a :param but their screen never reads it:\n" +
      offenders.map((o) => `   ${o.path}  ->  ${o.component}  (${o.file})`).join("\n") +
      "\n\n  Read it with useParams({ strict: false }) and select from your mock\n" +
      "  list, or the screen renders the same record for every URL.\n"
  );
  process.exit(1);
}

console.log("✓ param routes read their params");
