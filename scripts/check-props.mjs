// scripts/check-props.mjs
//
// Fails if a flow screen renders module-level mock RECORDS without accepting
// them as a prop.
//
// Why this exists: AGENTS.md §3 promises that at integration, Dev wraps a
// screen in a controller and "the screen file itself doesn't change". That
// promise only holds if the screen takes its data as a prop with a mock
// default. A screen that reads a hardcoded array directly has to be edited the
// moment real data arrives — at which point the designer stops owning it.
//
// A real project built from this pack shipped three screens that each rendered
// their own hardcoded copy of the same card list. Nothing flagged it, because
// an earlier version of AGENTS.md offered inline mock data as an equal option
// while still making the no-change promise. Both sides can't be true.
//
//   const cards = [{ id: 1 }, { id: 2 }];
//   export default function CardsScreen() {          // ← fails
//     return cards.map(...)
//   }
//
//   export default function CardsScreen({ cards = mockCards }: Props) {  // ← passes
//
// ── Scope, deliberately narrow ────────────────────────────────────────────
//
// Only arrays of OBJECTS count. `const tabs = ["all", "recent"]` is labels,
// not data, and is left alone — that line keeps this check quiet enough to
// live in CI. If a genuinely static list of objects trips it, accepting it as
// a prop with a default costs one line and is never wrong.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FLOWS = "src/flows";

if (!existsSync(FLOWS)) {
  console.log("✓ props check skipped (no src/flows yet)");
  process.exit(0);
}

/** Every .tsx under src/flows, minus the pack's own infrastructure folders. */
function screens(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === "_devbar" ? [] : screens(full);
    }
    return full.endsWith(".tsx") ? [full] : [];
  });
}

const offenders = [];

for (const file of screens(FLOWS)) {
  const src = readFileSync(file, "utf8");

  // Strip comments so an example in a docblock can't trip the check.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//"))
    .join("\n");

  // The component's parameter list, if any: everything between the first
  // `function Name(` and its closing `)`.
  const sig = code.match(/export default function\s+\w+\s*\(([\s\S]*?)\)\s*\{/);
  const params = sig ? sig[1] : "";

  // Module-level `const NAME = [ {` — an array whose first element is an object.
  for (const m of code.matchAll(/^const\s+(\w+)\s*(?::[^=]+)?=\s*\[\s*\{/gm)) {
    const name = m[1];

    // Is it actually rendered, rather than just declared?
    const used = new RegExp(`\\b${name}\\s*\\.\\s*(map|filter|find|slice|length)\\b`).test(code);
    if (!used) continue;

    // Accepted as a prop default? `{ cards = mockCards }` or `= NAME`.
    if (new RegExp(`=\\s*${name}\\b`).test(params)) continue;

    offenders.push({ file, name });
  }
}

if (offenders.length) {
  console.error(
    "\n\u2716 These screens render mock records without taking them as props:\n" +
      offenders.map((o) => `   ${o.file}  (${o.name})`).join("\n") +
      "\n\n  Accept the data as a prop with the mock as its default, so Dev can pass\n" +
      "  real data later without editing your screen:\n\n" +
      "     type Props = { items?: Item[] };\n" +
      "     export default function Screen({ items = mockItems }: Props) { ... }\n\n" +
      "  A list of plain strings is labels, not data, and is never flagged.\n"
  );
  process.exit(1);
}

console.log("✓ flow screens take their data as props");
