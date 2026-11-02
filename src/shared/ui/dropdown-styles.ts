/** Shared presentation for Select and action/multi-select menus.
 * Keep Radix semantics separate; visual dimensions have one source of truth.
 */
export const dropdownStyles = {
  trigger:
    "flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-2 text-left text-sm font-normal text-foreground outline-none transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40 aria-expanded:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  content:
    "z-50 overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-sm text-popover-foreground shadow-md ring-1 ring-border",
  item: "relative flex min-h-10 cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm font-normal leading-5 outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  selectionItem: "pr-9",
  label: "px-3 py-2 text-xs font-medium text-muted-foreground",
} as const;
