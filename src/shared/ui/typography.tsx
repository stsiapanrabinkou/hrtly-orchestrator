// src/shared/ui/typography.tsx
//
// DESIGNER-OWNED. The type scale, as components.
//
// ── Why this file exists, and why it is HERE and not in components/ui ──────
//
// shadcn ships no Typography component. Their docs page on the subject says so
// outright — it is an example of utility classes, not something `shadcn add`
// can install. So this is ours: the one hand-written component in the pack.
//
// It lives in shared/ui rather than components/ui because components/ui is
// CLI-managed territory. Anything we put there is one `shadcn add` away from
// being clobbered, and it would inherit the relaxed generated-code lint tier
// it has no business inheriting.
//
// ── What problem it solves ────────────────────────────────────────────────
//
// Without it, every screen writes its own heading:
//
//   <h1 className="text-2xl font-semibold tracking-tight">
//   <h1 className="text-xl font-bold">
//   <h1 className="text-3xl font-semibold">
//
// That is type drifting outside the design system — the same failure as
// bg-blue-500, which the lint rules already ban. Three screens, three scales,
// and nothing to change when the scale changes.
//
// ── What it does NOT replace ──────────────────────────────────────────────
//
// Raw <h1>, <p>, <ul> remain legal and correct inside prose — see AGENTS.md §2.
// shadcn's typeset styles raw HTML by design, and rendered markdown should keep
// using it. Use these components for UI chrome: screen titles, section
// headings, labels, helper text. Use raw HTML for prose blocks.

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("text-foreground scroll-m-20", {
  variants: {
    level: {
      1: "text-3xl font-semibold tracking-tight",
      2: "text-2xl font-semibold tracking-tight",
      3: "text-lg font-semibold tracking-tight",
      4: "text-base font-medium tracking-tight",
    },
  },
  defaultVariants: { level: 2 },
});

type HeadingLevel = 1 | 2 | 3 | 4;

export function Heading({
  level = 2,
  className,
  as,
  ...props
}: React.ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & {
    level?: HeadingLevel;
    /**
     * Render a different tag than the level implies.
     *
     * Visual weight and document outline are separate concerns: a card title
     * that should look like a level 3 might still need to be an <h2> for
     * screen readers, or a <div> inside a landmark that already has a heading.
     * Without this escape hatch designers pick the level that *looks* right
     * and the heading order quietly breaks.
     */
    as?: "h1" | "h2" | "h3" | "h4" | "div";
  }) {
  const Tag = as ?? (`h${level}` as const);
  return (
    <Tag
      data-slot="heading"
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
}

const textVariants = cva("", {
  variants: {
    variant: {
      body: "text-sm text-foreground",
      lead: "text-base text-muted-foreground",
      small: "text-xs text-muted-foreground",
      muted: "text-sm text-muted-foreground",
      mono: "font-mono text-xs text-muted-foreground",
    },
  },
  defaultVariants: { variant: "body" },
});

export function Text({
  variant,
  className,
  as = "p",
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof textVariants> & { as?: "p" | "span" | "div" }) {
  const Tag = as;
  return (
    <Tag data-slot="text" className={cn(textVariants({ variant }), className)} {...props} />
  );
}

// The cva builders are deliberately NOT exported.
//
// shadcn exports buttonVariants because you genuinely need it to style a link
// as a button via asChild. Typography has no equivalent need, and exporting
// non-components from this file trips react-refresh/only-export-components —
// a rule that is switched off for CLI-generated code but stays ON here, since
// this file is hand-written. Keeping them private is the honest fix; adding an
// exemption for our own convenience would not be.
