# AGENTS.md – Frontend Architecture & Design-in-Code Workflow

> This file is written to be loaded as **agent instructions**. If you are an AI assistant (Claude Code, Cursor, Copilot, v0, etc.) working in this repo, read this whole file before writing a single line. The first thing you do in a session is the **role gate** below — no exceptions.

## 0. Role gate — do this before anything else

Interfaces here are built **in code, skipping the mockup stage**. Two different people touch this repo with two completely different mandates. Before you help anyone "vibe-code" a screen, you must know which one you're talking to.

**First action of every session, ask:**
> **Are you working as the _Designer_ (UI only) or the _Front-end developer_ (integration, logic, state, API)?**

Then operate in exactly one mode until told otherwise:

- **Designer — Design Mode.** Pure presentation **plus navigable flows**. You compose shadcn/ui components and semantic theme tokens into layouts and states; you create "dumb" presentational components in `src/shared/ui/` or `src/features/*/ui/`; and you assemble them into **navigable user-flows on mock data** in `src/flows/` (route-group folders + a declarative route tree). You navigate with `Link` / `useNavigate` / `useParams`. You do **not** write data fetching (TanStack Query), business logic, global state (Zustand), **routing logic** (loaders, guards, redirects, data-on-route-entry), or models/validators (Zod). If a task seems to require any of that, you stop and explain why instead of doing it.
- **Front-end — Integration Mode.** You own the wiring: real data hooks (`src/features/*/api`), state (`src/features/*/store`), smart components (`src/features/*/controllers`), Zod schemas (`src/features/*/models`), and the **router instance + routing logic** (`src/app`) — you consume the Designer's route tree from `src/flows/` and attach loaders, guards, redirects, and code-splitting. You leave presentation, flows, and theme alone unless a real gap forces a change.

If the person hasn't answered yet, assume **Design Mode** and say so — it's the safe default, because Design Mode can never break logic that isn't there.

**If the project folder is empty (first run):** follow `SETUP.md` to scaffold the app and its guardrails, end on the readiness screen, then wait for the designer's first screen prompt. Don't build product UI during init.

## 1. Pipeline

1. **UX/UI** builds the interface directly in code: presentational components assembled from shadcn/ui + the shared theme (data via Props), then wired into **navigable user-flows on mock data** (`src/flows/`) so the whole thing is clickable end to end.
2. **Dev** picks up the flows, creates "smart" controllers, wires them to TanStack Query (API) and Zustand (State), converts the flow route tree into the real router (loaders/guards/redirects in `src/app`), and passes real data into the Designer's components — the screens themselves don't change.
3. Stakeholder/client review happens against the **running app**, not static mocks. Design and implementation are the same artifact.

## 2. What "building in code" means with shadcn/ui

**Read this section carefully even if you have used the antd or MUI version of this kit. shadcn is not a component library in the sense those were, and three of the rules are inverted.**

shadcn does not live in `node_modules`. `npx shadcn add button` **copies source into `src/components/ui/`**. You own that code, you can edit it, and it is designer territory. That single fact drives everything below.

- **Compose from `@/components/ui`, don't rebuild it.** `react/forbid-elements` errors on `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, the `<table>` family, `<hr>`, `<dialog>`, `<progress>` and `<kbd>` inside hand-written presentation. Reach for the component named in the error message.
- **Raw HTML for text and layout is CORRECT here.** `<h1>`–`<h6>`, `<p>`, `<blockquote>`, `<ul>`/`<ol>`/`<li>`, `<code>`, `<div>`, `<span>`, `<section>`, `<nav>`, `<a>`, `<img>` and `<form>` are all legal and expected. shadcn styles raw HTML through **typeset** (`<div className="typeset">`), so hand-writing a heading *is* the shadcn answer to typography. This is the opposite of the antd rule and it is deliberate — do not "fix" it.
- **Styling is `className` with Tailwind utilities. The `style` prop is a lint error.** There is no `*.styles.ts` file in this kit, unlike every previous one. Anything you would have put in a style object — fixed positioning, z-index, a width — is a utility class.
- **Semantic tokens only.** `bg-primary`, `text-muted-foreground`, `border-input`, `bg-destructive`. Raw palette utilities (`bg-blue-500`, `text-zinc-700`) are a lint error, and so are literal colours and arbitrary colour values (`bg-[#1677ff]`). Arbitrary **sizes** (`w-[340px]`, `max-h-[60vh]`) are fine — the ban is on colour, not on brackets.
- **Theme lives in `src/theme/theme.css`.** It is the one file allowed to contain raw colour values, as oklch custom properties. Change a token there and every screen moves. Note the inversion: the antd/MUI packs banned CSS and put colour in a `.ts` file; here CSS *is* the theme.
- **Editing `src/components/ui/` is allowed — the `cva` variant maps especially.** That is where a button's visual identity lives, and adjusting it is design work, not dev work. Keep to the variant strings and className values; leave the Radix wiring, the `data-slot` attributes and the prop plumbing alone.
- **Adding a component is `npx shadcn add <name>`, never hand-writing one.** If you need a Combobox, install it. If you genuinely need something shadcn has no component for, compose it from what is installed before building anything custom.
- **Look up the API instead of guessing it.** `npx shadcn docs <component> -b radix` prints the real props for the installed base. Since the component source is local and unfamiliar, inventing props is the most common failure mode here — don't.
- **UI text comes from `@/shared/ui/typography`; prose stays raw HTML.** `<Heading>` and `<Text>` exist because shadcn ships no typography component (their docs page is explicitly an example of utility classes, not something `shadcn add` installs). Without them every screen invents its own `text-2xl font-semibold tracking-tight`, which is the type scale drifting outside the design system — the same failure as `bg-blue-500`. Use them for screen titles, section headings and helper text. Keep raw `<h1>`/`<p>`/`<ul>` for prose blocks and rendered markdown, where typeset styles them.
- **Extract on the second use, not the third.** The moment a screen needs something another screen already has, it moves: shared markup to `src/shared/ui/`, shared mock records to `src/flows/_mocks/`, shared behaviour to `src/shared/hooks/`. Copy-pasting a screen and editing 5% of it is how you get two files that drift apart — and the cross-flow import ban means the copy is the only option the linter leaves you, so take the hint and extract instead.
- **Use the components' own state props, presentationally.** `disabled`, `aria-invalid`, `<Skeleton>`, `<Empty>`, `<Spinner>` — drive them from props, never from a real network request during Design Mode.

## 3. Project structure (Domain-Driven Design)

```text
/src
  /app                  # Dev only: router INSTANCE + routing logic (loaders, guards,
                        #   redirects, code-splitting), global providers.
    router.tsx          #   The BRIDGE: consumes flows/routes.tsx generically and builds
                        #   the real route tree from it. Created once, at init, already
                        #   generic — adding a flow must never require editing this.
  /components
    /ui                 # Designer: shadcn component source, written by `shadcn add`.
                        #   Designer-owned and editable (cva variants especially), but
                        #   GENERATED — see §2 and the lint tiers in §10.
  /hooks
    use-mobile.ts       # Written by `shadcn add`. CLI-ONLY folder, generated lint tier.
                        #   Your own hooks go in /shared/hooks, not here.
  /lib
    utils.ts            # `cn()`. shadcn's own default location; left where the CLI puts it.
  /flows                # Designer: navigable user-flows on mock data.
                        #   Route-group folders + a declarative route tree. NO logic.
    /home
      HomeScreen.tsx    #   Composes ui/ components, holds inline mock data, links out.
    /loans
      LoansListScreen.tsx
      /loan-details
        LoanDetailsScreen.tsx   # route: /loans/:id  (reads id via useParams)
    routes.tsx          #   { path, component, children, meta? } tree. Structure + nav
                        #   only — no loaders, no guards, no data fetching.
    /_ready             #   ReadyView.tsx — the init status screen. Designer-owned so
                        #   the first real prompt can delete it. Gone after that.
    /_devbar            #   Dev-only nav bar (DevBar.tsx) + flatten.ts. Reads routes.tsx
                        #   to build a jump-to-screen switcher. Never ships to production.
    /_mocks             #   Mock data shared by two or more flows. The ONE place a flow may
                        #   import across folders — see "One flow, one folder" below.
  /shared
    /ui                 # Designer: Reusable "dumb" UI elements, layout primitives
      typography.tsx    #   Heading / Text. The type scale — ours, not shadcn's.
    /hooks              # Designer: shared presentational behaviour (useDisclosure,
                        #   useRequiredField). NOT src/hooks — that is the CLI's.
  /features
    /FeatureName
      /ui               # Designer: Feature-specific "dumb" UI elements
      /controllers      # Dev: "Smart" components (orchestrate UI, queries, state)
      /models           # Dev: Zod schemas and derived TS types
      /api              # Dev: TanStack Query hooks (useQuery, useMutation)
      /store            # Dev: Zustand client state
      index.ts          # Public API for the feature
  /theme                # Designer: theme.css (oklch tokens — the ONLY place raw colour
                        #   is allowed), ThemeProvider.tsx (light/dark class toggle)
  /stories              # Designer: ThemeShowcase.stories.tsx, FlowMap.stories.tsx
```

**No `*.styles.ts` files.** Styling is `className`. See §2.

**One flow, one folder — and flows never import each other.**

A folder under `/flows` is one domain. `home/` holds the home screen; cards live
in `cards/`, profile in `profile/`. A folder that accumulates three domains is
the thing to avoid — split it before it grows, not after.

Flows are **sealed from each other**, and ESLint enforces it:

```tsx
// flows/loading/LoadingScreen.tsx
import CardsScreen from "../cards/CardsScreen";   // ✗ error: cross-flow import
import { cards }    from "../_mocks/cards";       // ✓ shared mock data
import { CardTile } from "@/shared/ui/CardTile";  // ✓ shared presentation
```

When two flows need the same thing, it is one of two things and never a third:

- **Shared data** → `src/flows/_mocks/<name>.ts`, imported by both.
- **Shared UI** → a component in `src/shared/ui/`, imported by both.

Copy-pasting instead is what produces three drifting versions of the same card
list, which is exactly what happened on the first project built from this pack.
If you catch yourself duplicating a mock array into a second screen, stop and
move it to `_mocks` — that is what the folder is for.

**A `:id` screen must actually read its `:id`.**

A detail screen at `loans/:id` that renders the same record no matter the URL is
not a screen, it is a mock with extra steps — and it looks finished in review,
which is worse. Read the param and pick from your mock list:

```tsx
import { useParams } from "@tanstack/react-router";
import { transactions } from "../_mocks/transactions";

export default function TransactionDetailsScreen() {
  const { id } = useParams({ strict: false });
  const tx = transactions.find((t) => t.id === id) ?? transactions[0];
  return <TransactionCard tx={tx} />;
}
```

Give the route a `meta.sampleParams` so the DevBar and Flow Map can link
straight to a real one. CI asserts that every route whose path contains a
`:param` has a component that calls `useParams`.

**Fixed and sticky chrome must anchor to `--devbar-height`.**

The DevBar is `fixed` at the top of the viewport in development. It publishes
its own height as a CSS custom property, and `theme.css` defaults that property
to `0px`, so this markup is correct everywhere:

```tsx
<header className="sticky top-(--devbar-height) z-40 ...">
```

Use `top-0` on an app header instead and the DevBar covers it in development —
the app's own navigation becomes unclickable. A spacer cannot fix this; a spacer
only moves content that is in normal flow.

**Prose tables are the one `<table>` exception.** The element ban targets data tables, which should be `<Table>`. If you are rendering markdown inside a `.typeset` container, raw `<table>` is what typeset styles — put that rendering in a dev-owned component rather than fighting the lint rule in a flow screen.

**Route `meta` (optional, design annotation only):** a route may carry
`meta?: { role?, flow?, label?, sampleParams? }` — used to group and label screens
in the DevBar and flow overviews, and to supply a sample `:id` so detail screens
are clickable. It is **documentation, not enforcement**: `meta.role: 'admin'`
does not restrict anything. Real role guards are Dev's, in `/app`.

**How `/flows` stays logic-free (the seam):** designers declare routes as plain
structure in `flows/routes.tsx` — `{ path, component, children, meta? }` and
nothing else. There is no field for a loader or guard, so there's nowhere to put
logic.
A screen is a **dumb component**: it composes `ui/` parts, holds **inline mock
data** (or takes props with mock defaults), navigates with `Link` / `useNavigate`,
and reads params with `useParams`. During integration, Dev builds the real router
in `/app` from that route tree (attaching loaders/guards/redirects) and swaps each
screen's mock defaults for a controller that feeds real props. The screen file
itself doesn't change.

**Route syntax (read this before your first detail screen):** designers write
params as `:id` — readable, and it's what the DevBar and Flow Map render.
`/app/router.tsx` translates to TanStack's `$id` on the way in. Never write `$id`
in `/flows`. Read params with `useParams({ strict: false })`: the tree is built
at runtime from your file, so TanStack can't literal-type the routes, and `strict`
mode would demand a `from` you don't have.

**Nesting:** a node with `children` becomes a layout, and its own `component`
becomes that layout's index route. So `{ path: "loans", component: List,
children: [{ path: ":id", component: Details }] }` gives you `/loans` → List and
`/loans/1001` → Details, which is what you'd expect. You don't need an `<Outlet/>`
in List.

## 4. The core rule: Smart vs. Dumb

UI components (`shared/ui` or `features/*/ui`) **never** know where their data comes from. They receive data strictly through `Props` and emit actions strictly through `Callbacks`.

Smart controllers (`features/*/controllers`) fetch data using TanStack Query hooks from `features/*/api` and pass that data down to the UI components.

**Flow screens (`src/flows/*`) are dumb too.** They compose `ui/` components, move between screens with `Link` / `useNavigate` / `useParams`, and contain no fetching, no state stores, no loaders, no guards.

**A screen takes its data as a prop with a mock default. This is not one of two options.**

```tsx
const mockCards: Card[] = [ /* ... */ ];

type Props = { cards?: Card[] };

export default function CardsScreen({ cards = mockCards }: Props) { ... }
```

TanStack renders route components with no props, so the default supplies the
mock in Design Mode and the screen works standalone. At integration Dev wraps
it in a controller that passes real data — and **the screen file does not
change**, which is the entire reason the seam is worth having.

Hardcode the array inside the component instead and that promise silently
breaks: the screen has to be edited the day real data arrives, and the designer
stops owning it. A real project built from this pack shipped three screens each
rendering their own hardcoded copy of the same card list, precisely because an
earlier version of this document offered inline mock data as an equal option
while still making the no-change promise. Both could not be true.
`scripts/check-props.mjs` now enforces the prop form.

A list of plain strings (`["all", "recent"]`) is labels, not data — leave those
inline. The rule is about records.

**Who owns the Props contract:** a UI component or flow screen owns **its own Props interface** — that's the presentation contract. Dev's controller adapts models → those props. Designers define the shape they need and never wait on (or import) dev-owned `/models`.

## 5. Who owns what

| Area | Owner | Notes |
|---|---|---|
| `/theme` | UX/UI | `theme.css` is the visual identity. Required reviewer on any token change. |
| `/components/ui` | UX/UI | shadcn source. Editable — cva variants especially. Generated, so treat structural edits with care. Dev has full access when integration needs it. |
| `/hooks` | UX/UI | `shadcn add` output only. Generated tier. Your own hooks go in `/shared/hooks`. |
| `/lib/utils.ts` | Shared | `cn()`. Effectively frozen; shadcn regenerates it. |
| `/flows/_mocks` | UX/UI | Mock data shared by two or more flows. |
| `/shared/ui`, `/features/*/ui` | UX/UI | Pure markup, shadcn composition, className, prop contracts. |
| `/shared/ui/typography.tsx` | UX/UI | The type scale. The one hand-written component in the pack. |
| `/shared/hooks` | UX/UI | Shared presentational behaviour. Authored tier, full rules. |
| `/flows` | UX/UI | Navigable screens, route tree (`routes.tsx`), nav links. Mock data only, no routing logic. |
| `/flows/_ready` | UX/UI | Init status screen. Delete it with your first real flow. |
| `/flows/_devbar` | UX/UI | Dev-only nav bar. Dev mounts it once in `/app`; designers own its contents. |
| `/app` (router instance + routing logic) | Dev | Builds the real router from `/flows`, attaches loaders/guards/redirects, global providers. **Written once at init and generic** — if adding a flow makes you want to edit `/app`, that's a bug in the bridge, not a reason to switch modes. |
| `/features/*/controllers` | Dev | Smart logic. Wraps UI components with queries and state. |
| `/features/*/api`, `/store` | Dev | TanStack Query and Zustand implementations. |
| `/features/*/models` | Dev | Zod schemas and validations. |
| `/stories` | UX/UI | Presentation review. |

## 6. Design Mode guardrails

When operating in Design Mode (helping a **designer**), you may touch **presentation and flows**: `src/components/ui/`, `src/shared/ui/`, `src/features/*/ui/`, `src/flows/`, `src/theme/`, and `src/stories/`.

**You MAY** build interactive, navigable prototypes-that-become-the-app:
- Open/close dialogs, sheets, dropdowns, tabs, popovers — local UI state (`useState`).
- **Navigate between screens** with `Link` / `useNavigate`, read route params with `useParams`, and declare the route tree in `src/flows/routes.tsx` (paths incl. `:id`, hierarchy, nav links).
- **Simulate** a submit: show a success message, close the dialog, flip to a "submitted" state — with the real work stubbed.
- Feed screens from **inline mock data** or props with mock defaults.
- Install components with `npx shadcn add <name>` and adjust their `cva` variants.
- Write raw `<h1>`, `<p>`, `<ul>`, `<div>` freely — see §2.
- Put mock data two flows both need in `src/flows/_mocks/`, shared markup in `src/shared/ui/`, shared behaviour in `src/shared/hooks/`.
- Use `<Heading>` and `<Text>` from `@/shared/ui/typography` for UI text.

**You MUST NOT — stop and explain instead:**
- Write data fetching of any kind: `fetch`, `axios`, `useQuery`, `useMutation`.
- Add global/business state (`zustand`), or **routing logic**: loaders, guards, `beforeLoad`, `redirect`, or loading data on route entry. Those live in `/app`.
- Wire real behavior into interactions: an `onSubmit` that mutates data, a click that calls a service. Stub these as `console.log` for Dev to wire.
- Modify anything in `api/`, `controllers/`, `store/`, `models/`, or `app/`.
- Hand-roll a control shadcn provides (`<button>`, `<input>`, `<select>`, `<table>`…) — install and compose instead.
- Use the `style` prop. Use `className`.
- Import from another flow's folder. Shared UI goes in `src/shared/ui`, shared mock data in `src/flows/_mocks`. Never copy a mock array into a second screen.
- Ship a detail screen at a `:param` route that ignores the param.
- Anchor fixed or sticky chrome to `top-0`. Use `top-(--devbar-height)`.
- Ship a screen that reads a hardcoded array instead of taking it as a prop with a mock default. See §4 — this breaks the handoff promise.
- Hand-roll a heading with ad-hoc classes (`text-2xl font-semibold`) instead of `<Heading>`.
- Put your own hooks in `src/hooks/` — that folder belongs to the shadcn CLI. Use `src/shared/hooks/`.
- Leave a screen with no way out. Every state — including "pending", "rejected" and "error" — needs at least one control that moves the user somewhere, even if the action is stubbed. The same applies to individual controls: a "View all" link or a list row that goes nowhere is unfinished, not minimal. Stub the destination if it does not exist yet.
- Use a raw palette utility (`bg-blue-500`), a literal colour (`#1677ff`), or an arbitrary colour (`bg-[#1677ff]`). Use a semantic token, or add one to `src/theme/theme.css` — the one file where raw colour belongs.
- Reach for another styling system: styled-components, emotion, CSS modules, a second component library. The theme is `theme.css` custom properties consumed through Tailwind utilities, full stop.
- **Flip `.workflow-mode` to `dev` to get a commit through.** If the guard blocks you, that IS the answer — report what you hit and stop. Mode changes are a human decision.

## 7. Reviewing the work

`npm run dev` runs the app (`:5173`) and Storybook (`:6006`) together — Storybook isn't optional here, the DevBar links straight into it.

- **Component states:** Storybook.
- **Theme check:** The **Theme Showcase** story renders every semantic token as a static utility class in both light and dark. If you change `src/theme/theme.css` and a swatch doesn't move, the `@theme inline` block is broken. If a swatch moves but a screen doesn't, that screen bypassed the theme.
- **Flow overview:** The **Flow Map** story (`System/Flow Map`) renders every screen in `flows/routes.tsx`, grouped by flow and filterable by role, with click-through into the running app. The DevBar's "Flow map" button opens it directly — its story ID (`system-flow-map--all-flows`) is load-bearing; renaming the story's `title` or export breaks that button.

## 8. Required AI prompt for Design-Mode layout work

When a designer uses AI to build or change UI, use this as the system prefix **every time**:

> ROLE: Designer, Design Mode. Presentation + navigable flows. You may modify only: /src/components/ui, /src/shared/ui, /src/features/*/ui, /src/flows, /src/theme, and /src/stories.
> Build EVERYTHING from shadcn/ui components in @/components/ui. Install what's missing with `npx shadcn add <name>`; never hand-roll a control shadcn provides. Check props with `npx shadcn docs <component> -b radix` instead of guessing.
> Style with className and Tailwind utilities ONLY. The `style` prop is banned. There are no *.styles.ts files.
> Colour comes from semantic tokens (bg-primary, text-muted-foreground, border-input). No raw palette utilities (bg-blue-500), no literal colours, no arbitrary colour values. Arbitrary sizes like w-[340px] are fine. New colours go in /src/theme/theme.css as oklch custom properties.
> Raw <h1>, <p>, <ul>, <div>, <a>, <img>, <form> are CORRECT — shadcn styles raw HTML via typeset. Do not replace them with components.
> Every flow screen takes its data as a prop with a mock default: `function Screen({ items = mockItems }: Props)`. Never read a hardcoded array directly — Dev must be able to pass real data without editing your file. Plain string lists are labels, not data, and can stay inline.
> UI text (titles, section headings, helper text) uses <Heading> and <Text> from @/shared/ui/typography. Raw <h1>/<p>/<ul> stay correct for prose blocks.
> Extract on the SECOND use: shared markup to /src/shared/ui, shared mock records to /src/flows/_mocks, shared behaviour to /src/shared/hooks. Never copy a screen and edit 5% of it.
> One folder per domain under /src/flows, and flows must NOT import each other. Shared UI goes in /src/shared/ui; mock data two flows both need goes in /src/flows/_mocks. Never copy a mock array into a second screen.
> A screen at a :param route MUST read the param with useParams({ strict: false }) and select from the mock list — never render a fixed record.
> Fixed or sticky chrome uses top-(--devbar-height), never top-0.
> Every screen state (including pending/rejected/error) and every control you render must lead somewhere — stub the destination rather than leaving a dead link.
> UI components and flow screens must be "dumb" — data via Props (mock defaults are fine), events via Callbacks.
> You MAY build navigation: Link, useNavigate, useParams, and the route tree in /src/flows/routes.tsx (paths incl. :id, hierarchy, nav links). You MAY open dialogs/sheets and simulate submits (stub the real work as console.log).
> Do NOT modify /src/features/*/api, /controllers, /store, /models, or /src/app.
> Do NOT write data fetching (React Query, axios, fetch), global state (Zustand), or routing LOGIC (loaders, guards, redirect, data-on-route-entry). Those belong to Dev.

## 9. Making agents read this first

For the role gate to actually fire, save/symlink this file's content under conventions your tools use:
- **`AGENTS.md`** — emerging cross-tool convention.
- **`CLAUDE.md`** — Claude Code.
- **`.cursorrules`** — Cursor's per-repo rules.
- **`.github/copilot-instructions.md`** — GitHub Copilot.

## 10. Enforcement — deterministic, no AI required

These checks read the diff and block violations. No agent judgement involved.

**1. ESLint — live, in the editor.**
The rules live in **`eslint.presentation.js`** at the repo root, exported as a flat-config fragment and **appended** to the `eslint.config.js` that init creates. (The current Vite react-ts template ships **oxlint**, not eslint; init removes it so the project has a single linter. See SETUP.md steps 4 and 11.)

```js
// eslint.config.js
import { presentationRules } from "./eslint.presentation.js";

export default tseslint.config([
  globalIgnores(["dist", "storybook-static"]),
  // ...the react-ts baseline init sets up — typescript-eslint, react-hooks,
  //    react-refresh. These MUST survive.
  ...presentationRules,   // last, so its bans win any conflict
]);
```

> **Append, never replace.** Dropping `presentationRules` in as the whole config
> deletes `react-hooks` and `typescript-eslint`, which means `--max-warnings=0`
> in CI passes over a config with no real rules — a green check that proves
> nothing. Verify with
> `npx eslint --print-config src/flows/routes.tsx`: it must list
> `react-hooks/rules-of-hooks` **and** `react/forbid-elements`.

### Two tiers, and why

This is the one structural difference from every previous version of this kit. Those libraries lived in `node_modules`, so a single set of rules could apply to all presentation. shadcn's components are **source files in your repo**, and that source legitimately does things the designer must not: raw `<button>` and `<table>`, `style={{ transform }}` in `progress.tsx`, `text-white` in the destructive button and badge variants, `bg-black/50` for the dialog and sheet scrims, `[&_.recharts-dot[stroke='#fff']]` selectors in `chart.tsx`.

A single-tier config lifted from the antd pack fails on `shadcn add` output before the designer has written a line. So:

Two additions came from a real project rather than from theory. `src/hooks/**` is in the generated tier because the CLI writes `use-mobile.ts` there, not into `components/ui` — leaving it out meant that one file got the raw baseline rules and broke lint. And fifteen of `eslint-plugin-react-hooks`'s seventeen rules are off for generated code: they are React Compiler code-quality rules, and `carousel.tsx`, `sidebar.tsx` and `use-mobile.ts` all trip them. `rules-of-hooks` and `exhaustive-deps` stay on.

| Rule | `src/components/ui/**`, `src/hooks/**` (generated) | `flows`, `shared/ui`, `features/*/ui`, `stories` (hand-written) |
|---|---|---|
| no-logic imports (`api`, `store`, `controllers`, `models`, `app`) | yes | yes |
| no data fetching (`axios`, `useQuery`, `fetch`) | yes | yes |
| no raw palette utilities (`bg-blue-500`) | yes | yes |
| no arbitrary colour values (`bg-[#1677ff]`) | yes | yes |
| `react/forbid-elements` | no | yes |
| no literal colours (`#hex`, `oklch(`) | no | yes |
| no `bg-white` / `text-black` | no | yes |
| no `style` prop | no | yes |
| React Compiler rules (`purity`, `set-state-in-effect`, …) | no | yes |
| no cross-flow imports | no | `src/flows/**` only |

Both tiers are **designer** territory. This is a generated-vs-hand-written split, not an ownership split.

> **One `no-restricted-syntax` per tier, restated deliberately.** Flat config
> REPLACES rule options rather than merging them: two config objects matching the
> same file that both set `no-restricted-syntax` means the later one silently
> deletes the earlier one. The authored tier therefore **restates** the two
> colour rules from the shared tier. Remove them as duplicates and the colour
> bans stop applying to `/flows` — exactly the files they exist to protect. The
> same trap ate the no-logic import bans in the first version of the antd kit,
> silently, for months, with CI green.

**2. Scope check — the `.workflow-mode` gate (`scripts/check-scope.mjs`)**
Fails the commit/PR if a `designer` diff touches off-limits DDD areas: `src/features/*/{api,controllers,store,models}`, `src/app/`, and tests.

- Locally it reads `git diff --cached` — only what you're actually committing, so unstaged scratch work can't block an unrelated design commit.
- In CI it reads `git diff ${GITHUB_BASE_REF}...HEAD` — **three-dot**, against the merge base. Two-dot reports commits others landed on `main` as reversed changes and fails PRs that never touched a forbidden path.
- `src/flows/` and `src/components/ui/` are intentionally not forbidden — designers own both.

**Known limit, stated plainly:** `.workflow-mode` is a text file in the repo, so the gate is a *seatbelt, not a lock*. It catches the honest mistake — an agent drifting into `/store` mid-task — and it makes the boundary visible in review. It does not stop anyone who decides to flip the file. §6 forbids agents from doing that; if you want it to be a real lock, derive the mode from the branch name or a PR label in CI instead of from the working tree.

**3. Pre-commit & CI**
Husky runs `lint-staged`, `check-scope.mjs`, `check-params.mjs` and `check-props.mjs` locally. `.github/workflows/scope-guard.yml` runs both in CI, plus `tsc -b`, a production `vite build`, and a Storybook build.

CI additionally runs a **negative test**: it writes a temp file that violates one
rule from each block and fails the job if they don't all fire. A guardrail that
is configured but inert looks identical to one that works, so the only honest
check is to break it on purpose. It also runs a **positive test** on
`src/components/ui/`, because a rule that is too aggressive breaks `shadcn add`
just as badly as a missing rule breaks the seam.

`check-scope.mjs` **fails closed in CI.** It skips only for the one legitimate
case — a repo with no commits yet, which can only happen locally during init.
If the base ref won't resolve in CI it exits 1 with an explanation, because a
guard that cannot run is not a guard that passed.

**Type checking uses `tsc -b`, never `tsc --noEmit`.** The Vite react-ts template's
root `tsconfig.json` is a solution file (`"files": []` + project references), so
`tsc --noEmit` type-checks **zero files and exits 0**. Verified: a file containing
`const bad: number = "a string"` passes `--noEmit` and fails `-b`. The antd version
of this kit used `--noEmit` in both SETUP and CI; both were green checks over
nothing.
