// scripts/check-scope.mjs
//
// Fails the commit/PR if a "designer" diff touches off-limits areas.
// Reads the current mode from .workflow-mode (designer | dev) at repo root.
// In dev mode it does nothing. Adjust the `forbidden` patterns to your tree.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const mode = existsSync(".workflow-mode")
  ? readFileSync(".workflow-mode", "utf8").trim()
  : "dev";

if (mode !== "designer") process.exit(0); // dev mode: no restrictions

// Compare against the PR base in CI, or the staged set locally.
// In CI: three-dot against the merge base. Two-dot (`git diff origin/main`)
// also reports commits others landed on main as reversed changes, which fails
// PRs that never touched a forbidden path.
// Locally: --cached, so only what's actually being committed is judged —
// unstaged scratch work in /app shouldn't block an unrelated design commit.
const inCI = Boolean(process.env.GITHUB_BASE_REF);
const range = inCI ? `${process.env.GITHUB_BASE_REF}...HEAD` : "--cached HEAD";

/**
 * FAIL CLOSED IN CI.
 *
 * There is exactly one legitimate reason to skip: a brand-new repo with no
 * commits, where `git diff --cached HEAD` has no HEAD to resolve. That only
 * happens locally, during init.
 *
 * The original version wrapped the diff in a bare try/catch and exited 0 on ANY
 * error. In CI that turned an unresolvable base ref into a green check — a
 * skipped guard and a passing guard printed the same thing. If the comparison
 * cannot be made in CI, that is a broken guard, and a broken guard must stop
 * the PR rather than wave it through.
 */
const hasHead = (() => {
  try {
    execSync("git rev-parse --verify HEAD", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

if (!hasHead) {
  if (inCI) {
    console.error("\n\u2716 scope check could not run: no HEAD in CI. Check the checkout step.\n");
    process.exit(1);
  }
  console.log("\u2713 scope check skipped (fresh repo, nothing committed yet)");
  process.exit(0);
}

// In CI the base ref must actually resolve, or we have nothing to compare to.
if (inCI) {
  try {
    execSync(`git rev-parse --verify ${process.env.GITHUB_BASE_REF}`, { stdio: "ignore" });
  } catch {
    console.error(
      `\n\u2716 scope check could not run: base ref "${process.env.GITHUB_BASE_REF}" does not resolve.\n` +
        "  The guard is not passing — it is unable to run. Ensure actions/checkout uses\n" +
        "  fetch-depth: 0 and that the base branch was fetched.\n"
    );
    process.exit(1);
  }
}

let files = [];
try {
  files = execSync(`git diff --name-only ${range}`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] })
    .split("\n")
    .filter(Boolean);
} catch (err) {
  console.error("\n\u2716 scope check could not run: git diff failed.\n  " + String(err.message).trim() + "\n");
  process.exit(1);
}

// Note: src/flows/ is intentionally NOT here — designers own navigable flows
// (screens + route tree) on mock data. Routing LOGIC lives in src/app/, which
// IS forbidden below, so the boundary holds: designers declare routes, dev
// wires loaders/guards/redirects.
const forbidden = [
  /^src\/features\/.*\/api\//,         // real integrations (TanStack Query hooks)
  /^src\/features\/.*\/controllers\//, // smart components / business logic
  /^src\/features\/.*\/store\//,       // state management (Zustand)
  /^src\/features\/.*\/models\//,      // data models and schemas (Zod)
  /^src\/app\//,                       // router instance, routing logic, global providers
  /^src\/tests?\//,                    // test suite
  /\.test\.[jt]sx?$/,                  // colocated tests
];

const bad = files.filter((f) => forbidden.some((re) => re.test(f)));

if (bad.length) {
  console.error(
    "\n\u2716 Design Mode (.workflow-mode=designer) may not touch:\n" +
      bad.map((f) => "   " + f).join("\n") +
      "\n\n  Move this work to a dev branch, or set .workflow-mode=dev " +
      "if this is integration work.\n"
  );
  process.exit(1);
}

console.log("\u2713 scope check passed (designer mode)");