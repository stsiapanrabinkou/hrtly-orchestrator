import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, SearchX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/shared/ui/typography";

export type ListState = "ready" | "loading" | "error" | "empty";
export function WorkspaceHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><Heading level={1}>{title}</Heading><div className="flex flex-wrap items-center gap-3">{children}</div></div>;
}
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  const id = `filter-${label.toLowerCase().replaceAll(" ", "-")}`;
  return <div className="min-w-0 space-y-2"><Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label><Select value={value} onValueChange={onChange}><SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}
export function ListFeedback({ state, empty = "No matching records.", onReset, hideEmptyAction = false, emptyActionLabel = "Clear filters" }: { state: Exclude<ListState, "ready">; empty?: string; onReset: () => void; hideEmptyAction?: boolean; emptyActionLabel?: string }) {
  if (state === "loading") return <div aria-busy="true" aria-label="Loading records" className="space-y-4 p-6">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div>;
  return <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center">{state === "error" ? <RefreshCw className="size-6 text-muted-foreground" /> : <SearchX className="size-6 text-muted-foreground" />}<Heading level={4} as="h2">{state === "error" ? "Records could not be loaded" : empty}</Heading>{(state === "error" || !hideEmptyAction) && <Button variant="outline" onClick={onReset}>{state === "error" ? "Try again" : emptyActionLabel}</Button>}</div>;
}
export function ListPagination({ page, total, pageSize = 12, onChange }: { page: number; total: number; pageSize?: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><Text variant="small">{total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}` : "0 records"}</Text><div className="flex items-center gap-3"><Button variant="outline" size="icon" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft className="size-4" /></Button><Text variant="small">Page {page} of {pages}</Text><Button variant="outline" size="icon" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight className="size-4" /></Button></div></div>;
}
