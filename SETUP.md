# SETUP.md – Project initialization (run once, in an empty folder)

This is the bootstrap runbook. A designer drops the guardrail files into an empty folder and tells an AI agent to run this. The agent scaffolds an empty-but-armed React + shadcn/ui project, incorporating Domain-Driven Design constraints, then stops.

**No product UI is created** — just one readiness screen that confirms the setup and lists what was done.

## For the designer
1. Create an empty folder and drop these **18** files into its root:
   `AGENTS.md`, `SETUP.md`, `check-scope.mjs`, `scope-guard.yml`, `.workflow-mode`,
   `eslint.presentation.js`, `check-params.mjs`, `check-props.mjs`, `router.tsx`, `routes.tsx`, `flatten.ts`, `DevBar.tsx`,
   `ReadyView.tsx`, `theme.css`, `ThemeProvider.tsx`, `typography.tsx`,
   `ThemeShowcase.stories.tsx`, `FlowMap.stories.tsx`.
2. Open the folder in Claude Code (or Cursor/Copilot) and send **one** message:
   > Read `SETUP.md` and initialize the project. Do exactly the steps in it, nothing else. Don't build any product UI — end on the readiness screen.
3. Wait. When it finishes, **both servers are running** — the app on `http://localhost:5173` and Storybook on `http://localhost:6006` — and your browser shows **"We're ready to start"** with the checklist. From then on, just describe screens and flows — they get built with shadcn/ui under `/src/flows`, clickable and navigable on mock data (Design Mode, per `AGENTS.md`).

## For the agent — execute in order

Scaffold **in the current folder** (the guardrail files already here are the policy; wire them in, don't overwrite them). Read `AGENTS.md` first — §2 in particular, because three of its rules are the **opposite** of what the antd and MUI versions of this kit said, and you will get them wrong if you pattern-match from those.

> **Four things in this runbook are non-negotiable, because getting them wrong breaks the whole premise:**
> - **Step 8** — the router bridge must be **generic from the start**. Do NOT hardcode an index route. If you do, the designer's first flow forces an `/app` edit, which means a dev-mode commit for work that is purely design. The bridge file is dropped in for you; use it as-is.
> - **Step 4** — the version pins are load-bearing. Dropping them to get "the latest" fails the install outright. Read the warnings; they are all things that actually happen, not hypotheticals.
> - **Step 10** — the current template ships **oxlint**, not eslint, so you **create** `eslint.config.js` with the react-ts baseline and **append** the presentation fragment. Those baseline rules must be present, or `--max-warnings=0` is a green check over an empty config.
> - **Step 7** — `ReadyView` goes in `/src/flows`, **not** `/src/app`. The designer's first prompt deletes it, and Design Mode cannot touch `/app`.

1. **Scaffold Vite + React + TS.** The folder already has the 15 dropped
   guardrail files in it, so `npm create vite@latest .` will see a non-empty
   directory, prompt, and — non-interactively — print *"Operation cancelled"*
   and write nothing. **Use the temp-dir route; it is the normal path, not a
   fallback:**
   ```bash
   npm create vite@latest ../_vite-tmp -- --template react-ts
   cp -r ../_vite-tmp/src ../_vite-tmp/public ../_vite-tmp/index.html \
         ../_vite-tmp/vite.config.ts ../_vite-tmp/tsconfig*.json \
         ../_vite-tmp/package.json ../_vite-tmp/.gitignore \
         ../_vite-tmp/.oxlintrc.json .
   rm -rf ../_vite-tmp && npm install
   ```
   Keep the dropped guardrail files untouched.
   > **The current react-ts template ships `oxlint`, not ESLint** — an `.oxlintrc.json` plus a `"lint": "oxlint"` script, and **no `eslint.config.js`**. This kit is ESLint-based (its guardrails *are* ESLint rules), so step 4 removes oxlint and installs the ESLint baseline, and step 10 *creates* `eslint.config.js`. The goal is **one linter**, not two side by side.

   Then **`git init`** if the folder isn't a repo yet — both Husky (step 11) and `check-scope.mjs` (step 12) need one, and they'll fail without it.

2. **Install Tailwind v4 and the app dependencies:**
   ```bash
   npm i tailwindcss @tailwindcss/vite tw-animate-css
   npm i zustand @tanstack/react-query @tanstack/react-router zod
   ```
   > **Tailwind v4 has no `tailwind.config.js` and no `postcss.config.js`.**
   > Configuration is CSS-first, and it all lives in `src/theme/theme.css`
   > (dropped in at step 6). If you find yourself writing a `tailwind.config.js`,
   > stop — you are following v3 instructions.

   Then wire the Vite plugin and the `@` alias, which shadcn requires:
   ```ts
   // vite.config.ts
   import path from "node:path";
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   import tailwindcss from "@tailwindcss/vite";

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
   });
   ```
   And add `paths` to `tsconfig.app.json`:
   ```jsonc
   {
     "compilerOptions": {
       "paths": { "@/*": ["./src/*"] },
       // ...the rest of the template's options, unchanged
     }
   }
   ```
   > **Do NOT add `"baseUrl": "."` alongside it.** The template pins TypeScript
   > `~6.0.2`, where `baseUrl` is deprecated and emits **TS5101 as an error**,
   > failing `tsc -b`. Modern `paths` resolves relative to the tsconfig's own
   > directory, so `baseUrl` is redundant as well as fatal. Most shadcn tutorials
   > still show it — they predate TS 6.

3. **Initialize shadcn and install every component.**
   ```bash
   npx shadcn@latest init -t vite -b radix --preset nova --base-color neutral --icon-library lucide -y
   npx shadcn@latest add -a -y
   ```
   > **`-b radix`, not the default.** shadcn's docs now default to Base UI, but
   > `@base-ui-components/react` is still `1.0.0-rc.0`. `radix-ui` is stable at
   > `1.6.x`, and the entire ecosystem of blocks, examples and third-party
   > registry components a designer will copy from is Radix-based. Pass `-b radix`
   > to `shadcn docs` too, or you will read Base UI props and write them into
   > Radix components.

   `init` writes `components.json`, `src/lib/utils.ts` (the `cn()` helper) and a
   global CSS file; `add -a` writes ~70 components into `src/components/ui/` and
   installs their companion packages (recharts, embla, cmdk, react-day-picker,
   vaul, sonner, input-otp, react-resizable-panels, react-hook-form).

   - **Leave `src/components/ui/` and `src/lib/utils.ts` where the CLI puts them.**
     They sit outside the DDD tree in §3, and that is deliberate: bending
     `components.json` aliases to fit the tree means fighting the CLI on every
     future `add`. The lint config already targets these paths.
   - **`form.tsx` and `chart.tsx` stay.** They are more logic-ish than the rest
     (react-hook-form, recharts) and they land in designer territory. That is a
     known, accepted smell — deleting them means `add` re-adds them later anyway.
   - If `init` overwrote the dropped `theme.css`, don't worry: step 6 replaces the
     CSS file it generated.

4. **Install dev tooling — pins are load-bearing:**
   ```bash
   npm i -D husky lint-staged concurrently eslint-plugin-react
   npm i -D eslint@^9 "@eslint/js@^9" typescript-eslint \
            eslint-plugin-react-hooks eslint-plugin-react-refresh globals
   ```
   - `concurrently` — step 12 runs the app and Storybook together.
   - `eslint-plugin-react` — step 10's `react/forbid-elements` needs it. This is what
     makes "compose, don't hand-roll" an actual rule instead of a note in a README.

   > **The `^9` pins are not decoration; unpinned, the install dies.**
   > `@eslint/js` has shipped v10, whose optional peer is `eslint@^10`.
   > `eslint-plugin-react` peers at `eslint@^3 || … || ^9.7`. Ask npm for both
   > unpinned and it resolves `@eslint/js@10` + `eslint@9`, then aborts with
   > `ERESOLVE could not resolve` before a single file is written.
   > `typescript-eslint` already accepts ESLint 10, so `eslint-plugin-react` is
   > the sole constraint — when it ships v10 support, both pins can go.
   > Do **not** work around this with `--force` or `--legacy-peer-deps`; you would
   > be running the guardrail plugin against a major it doesn't support.

   **Consolidate to one linter — remove oxlint.** Delete `.oxlintrc.json`, remove
   `oxlint` from `devDependencies`, and drop the `"lint": "oxlint"` script from
   `package.json` (step 11 wires the real lint scripts).

   - **Leave `typescript` alone.** The template pins `~6.0.2`, and
     `typescript-eslint` peers `>=4.8.4 <6.1.0`. An opportunistic
     `npm i -D typescript@latest` resolves to 7.x and every later install
     ERESOLVEs.

5. **Install Storybook:** `npx storybook@latest init --no-dev --yes --disable-telemetry`
   (step 12 launches it properly).
   > **`--no-dev`, not `--no-start`.** Storybook 10 renamed the flag; the old one
   > exits with `error: unknown option '--no-start'` and installs nothing.
   >
   > **Storybook detects TanStack Router and installs `@storybook/tanstack-react`,**
   > not `@storybook/react-vite`. The two dropped story files import their
   > `Meta` / `StoryObj` types from `@storybook/tanstack-react` to match. If your
   > install produced a different framework, change the type-only imports in
   > `.storybook/preview.tsx`, `ThemeShowcase.stories.tsx` and
   > `FlowMap.stories.tsx` to match it — **all three, or none.** Leave
   > `.storybook/main.ts` alone either way.

   Then **replace** `.storybook/preview.tsx` entirely:
   ```tsx
   import type { Preview } from "@storybook/tanstack-react";
   // Without this import every story renders unstyled: Tailwind's generated CSS
   // and the theme custom properties both live in theme.css.
   import "../src/theme/theme.css";

   const preview: Preview = {
     parameters: {
       controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
       a11y: { test: "todo" },
     },
   };
   export default preview;
   ```
   > **No ThemeProvider decorator here**, unlike the antd version of this kit.
   > shadcn's theme is CSS custom properties that are live as soon as the
   > stylesheet loads; the provider only toggles the `dark` class. The two
   > dropped stories wrap themselves where they need a specific mode.

   Delete Storybook's generated example stories (`src/stories/*` **and**
   `src/stories/assets/`) — but keep the folder; the dropped stories move in at
   step 6.

6. **Create the DDD folder structure** under `/src` and file the dropped files into it:
   ```text
   /app
     router.tsx   (Dev: router instance + the bridge that consumes /flows.
                   ReadyView is NOT here — see step 7.)
   /components
     /ui          (written by `shadcn add` in step 3 — leave in place)
   /hooks
     use-mobile.ts (written by `shadcn add` in step 3 — leave in place)
   /lib
     utils.ts     (written by `shadcn init` in step 3 — leave in place)
   /flows
     routes.tsx   (Designer: declarative route tree. ReadyView pre-registered at "/".)
     /_ready
       ReadyView.tsx    (Designer-owned: the init status screen. Deleted on first real flow.)
     /_devbar
       DevBar.tsx       (dev-only nav bar, reads routes.tsx)
       flatten.ts       (shared tree-flattening; DevBar + Flow Map both use it)
     /_mocks            (empty — mock data shared by two or more flows goes here)
     (Designer: navigable user-flows on mock data live here — route-group folders)
   /features
     (empty — smart controllers and business logic live here later)
   /shared
     /ui
       typography.tsx  (Heading / Text — the type scale. shadcn ships none.)
     /hooks (empty — designer-authored hooks. NOT src/hooks, which is the CLI's.)
   /theme
     theme.css, ThemeProvider.tsx
   /stories
     ThemeShowcase.stories.tsx, FlowMap.stories.tsx
   ```
   Moves — **do not rewrite these files, just move them**:
   - `routes.tsx` → `src/flows/routes.tsx`
   - `ReadyView.tsx` → `src/flows/_ready/`
   - `DevBar.tsx`, `flatten.ts` → `src/flows/_devbar/`
   - `router.tsx` → `src/app/router.tsx`
   - `theme.css`, `ThemeProvider.tsx` → `src/theme/`
   - `typography.tsx` → `src/shared/ui/typography.tsx`
   - `ThemeShowcase.stories.tsx`, `FlowMap.stories.tsx` → `src/stories/`

   **There are no `*.styles.ts` files in this kit.** If you are porting habits
   from the antd or MUI version: styling is `className`, and the `style` prop is
   a lint error. Don't create them.

   Then **delete the global CSS file `shadcn init` generated** (usually
   `src/index.css`) — `src/theme/theme.css` replaces it, and having both means
   two competing `@theme` blocks and duplicated token definitions.

7. **The readiness screen is already placed and already wired.** `ReadyView.tsx` moved to `src/flows/_ready/` in step 6, and `src/flows/routes.tsx` already registers it as the `/` route. Nothing else to do — the router in step 8 picks it up generically, like any other flow.
   - Update its `"shadcn/ui (radix base) + lucide-react"` checklist entry with the versions actually installed (check `npm ls radix-ui tailwindcss`), so the designer can see at a glance what this project is on. That's the only edit.
   - **It lives in `/flows` deliberately.** `/app` is dev-owned and off-limits in Design Mode; if ReadyView lived there, the designer's first act — replacing it — would trip the scope guard on day one.

8. **Wire the app to the router bridge.** `src/app/router.tsx` was dropped in at step 6 and is **already generic** — it recursively converts `flows/routes.tsx` into TanStack routes, translates `:id` → `$id`, and mounts `ThemeProvider` → `DevBar` → `<Outlet/>` at the root. **Do not simplify it to a hardcoded index route.** That one shortcut is what forces a dev-mode `/app` commit the moment the designer adds their first screen.

   Your job here is only to connect it:
   - Delete the Vite demo markup, logos, `App.css`, `src/assets/`, and the leftover `index.css`. `App.tsx` can go entirely.
   - Rewrite `src/main.tsx`:
     ```tsx
     import { StrictMode } from "react";
     import { createRoot } from "react-dom/client";
     import { RouterProvider } from "@tanstack/react-router";
     import "./theme/theme.css";
     import { router } from "./app/router";

     createRoot(document.getElementById("root")!).render(
       <StrictMode>
         <RouterProvider router={router} />
       </StrictMode>
     );
     ```
     > The `theme.css` import is the **only** stylesheet import in the app. Import
     > it before `./app/router` so the tokens are defined before anything renders.

   This is the router **shell**, not routing logic: no loaders, no guards, no data. Dev extends it during integration. Mounting the DevBar here is the one-time step that touches dev-owned `/app`, done now so designers never need to.

9. **File the guardrails into place:**
   - move `check-scope.mjs` → `scripts/check-scope.mjs`
   - move `check-params.mjs` → `scripts/check-params.mjs`
   - move `check-props.mjs` → `scripts/check-props.mjs`
   - move `scope-guard.yml` → `.github/workflows/scope-guard.yml`
   - leave `AGENTS.md`, `.workflow-mode` and `eslint.presentation.js` at root.
   - symlink or copy `AGENTS.md` to `.cursorrules` and `CLAUDE.md`.

10. **Create the ESLint config — baseline first, then APPEND the fragment.** The current template ships **no** `eslint.config.js` (it uses oxlint, removed in step 4), so write one with the react-ts baseline and add the dropped `eslint.presentation.js` fragment at the **end**:
    ```js
    // eslint.config.js
    import js from "@eslint/js";
    import globals from "globals";
    import reactHooks from "eslint-plugin-react-hooks";
    import reactRefresh from "eslint-plugin-react-refresh";
    import storybook from "eslint-plugin-storybook";
    import tseslint from "typescript-eslint";
    import { globalIgnores } from "eslint/config";
    import { presentationRules } from "./eslint.presentation.js";

    export default tseslint.config([
      globalIgnores(["dist", "storybook-static"]),
      {
        files: ["**/*.{ts,tsx}"],
        extends: [
          js.configs.recommended,
          tseslint.configs.recommended,
          reactHooks.configs.flat["recommended-latest"],  // .flat is REQUIRED — see note
          reactRefresh.configs.vite,
        ],
        languageOptions: { ecmaVersion: 2020, globals: globals.browser },
      },
      ...storybook.configs["flat/recommended"],
      ...presentationRules,   // last, so its bans win any conflict
    ]);
    ```
    Order matters: `presentationRules` last.

    > **`reactHooks.configs.flat["recommended-latest"]`, not
    > `reactHooks.configs["recommended-latest"]`.** As of
    > `eslint-plugin-react-hooks@7`, the non-`.flat` path still returns a legacy
    > eslintrc object with `plugins` as an array of strings. Flat config rejects
    > that shape and ESLint **refuses to start at all** — you get *"A config
    > object has a `plugins` key defined as an array of strings"* and zero files
    > linted. Not a warning, a hard stop, so it takes the whole init down with it.
    > Nearly every shadcn + Vite guide online shows the broken form.

    **Sanity check before moving on:**
    ```bash
    npx eslint --print-config src/flows/routes.tsx | grep -c "rules-of-hooks"
    npx eslint "src/components/ui/**/*.{ts,tsx}" "src/hooks/**/*.{ts,tsx}" --max-warnings=0
    ```
    The first must be non-zero. The second must pass — if `shadcn add` output
    fails lint, a rule from the authored tier leaked into the shared tier, and
    every future `add` will produce un-committable code. Fix it here, not later.
    `src/hooks/**` is in that glob on purpose: the CLI writes `use-mobile.ts`
    there, and it was the file that broke lint on the first real project.

11. **Wire package.json for scripts, Husky & lint-staged:**
    - Replace the `dev` script so **both servers come up together** — Storybook isn't optional, the DevBar links straight into it:
      ```json
      "scripts": {
        "dev": "concurrently -k -n app,storybook -c cyan,magenta \"npm:dev:app\" \"npm:dev:storybook\"",
        "dev:app": "vite",
        "dev:storybook": "storybook dev -p 6006 --no-open",
        "build": "tsc -b && vite build",
        "prepare": "husky"
      }
      ```
      (`-k` kills both when one dies, so Ctrl-C actually stops everything.)
    - Add to package.json: `"lint-staged": { "src/{components/ui,shared/ui,features/*/ui,flows,theme,stories}/**/*.{ts,tsx}": ["eslint --max-warnings=0"] }`
    - run `npm run prepare` (or `npx husky init`)
    - create `.husky/pre-commit` containing:
      ```bash
      npx lint-staged
      node scripts/check-scope.mjs
      node scripts/check-params.mjs
      node scripts/check-props.mjs
      ```

12. **Verify, then launch:**
    - `npx tsc -b` passes.
      > **`tsc -b`, never `tsc --noEmit`.** The template's root `tsconfig.json`
      > is a solution file (`"files": []` + project references), so
      > `tsc --noEmit` type-checks **zero files and exits 0**. A file containing
      > `const bad: number = "a string"` passes `--noEmit` and fails `-b`.
      > If you "verify types" with `--noEmit` you have verified nothing.
    - `npx eslint .` passes with zero warnings.
      (`@typescript-eslint/no-unused-vars` is an **error** in this baseline. If you
      added a component to an import list in `ThemeShowcase.stories.tsx` without
      rendering it, this is where init stops.)
    - `npx vite build` succeeds, and then confirm two things about the output:
      ```bash
      grep -rqF "Jump to screen" dist/assets/*.js && echo "DevBar LEAKED" || echo "ok"
      grep -rqF "bg-primary" dist/assets/*.css && echo "ok" || echo "theme NOT emitted"
      ```
      The second is the standard Tailwind v4 failure: if the `@theme inline` block
      in `theme.css` is broken, the custom properties still exist but no utility
      class is generated for them, and `bg-primary` silently does nothing — with
      no build error anywhere.
    - `node scripts/check-scope.mjs` passes (mode is `designer`; no forbidden paths touched yet).
    - `node scripts/check-params.mjs` passes (nothing to check yet — it starts mattering with the first `:id` route).
    - `node scripts/check-props.mjs` passes. ReadyView already follows the pattern it enforces, so this is also a smoke test that the check itself works.
    - `npm run dev` — **leave it running.** Confirm **both** are actually up before reporting:
      - app responds at `http://localhost:5173` and renders the readiness screen
      - Storybook responds at `http://localhost:6006`
      - the **Theme Showcase** stories render, in both Light and Dark
      - the **Flow Map** story renders at `/?path=/story/system-flow-map--all-flows` — this is the exact URL the DevBar's "Flow map" button opens. If it 404s, the story's `title`/export name drifted; fix it, don't ship a dead button.
    - Click the DevBar's **Storybook**, **Flow map** and **theme toggle** buttons once. The first two must land on a real page; the third must flip the whole app to dark.

## Definition of done
- App compiles (`tsc -b`), `eslint .` is clean, `vite build` succeeds, and **both** dev servers are running (5173 + 6006).
- Browser shows **only** the readiness screen ("We're ready to start" + checklist), and the DevBar's theme toggle flips it to dark.
- Storybook shows the **Theme Showcase** (Light and Dark) and the **Flow Map**, and both DevBar buttons reach them.
- `eslint --print-config` proves react-hooks and react/forbid-elements are both live, **and** `src/components/ui/**` lints clean.
- Production bundle contains no DevBar strings; production CSS contains `bg-primary` and the `--primary` custom property.
- **One linter:** the scaffold's oxlint is gone — no `.oxlintrc.json`, no `oxlint` dep or `oxlint` script — and `eslint.config.js` is the single source of lint rules.
- **No `tailwind.config.js`, no `postcss.config.js`, no `src/index.css`.** Tailwind v4 is configured entirely inside `src/theme/theme.css`.
- `src/app/router.tsx` builds its tree from `flows/routes.tsx` generically — grep it for hardcoded screen paths; there should be none.
- No product components, forms, or features exist yet.
- `src/flows/_mocks/` and `src/shared/hooks/` exist; `src/hooks/` is CLI-only and covered by the generated lint tier.
- `src/shared/ui/typography.tsx` is in place and ReadyView renders through it.
- `.workflow-mode` is `designer`; guardrails (ESLint, pre-commit, CI) are armed against modifying `api/`, `controllers/`, `store/`, `models/`, and `app/`.
- Report the checklist of what was installed/created and **both** URLs, then stop and wait for the designer's first screen prompt.
