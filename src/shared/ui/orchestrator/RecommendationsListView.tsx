/** WBS: Orchestrator (FULL), rows 108–112. Interactive presentation on mock records. */
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/shared/ui/typography";
import { patients, recommendations, type Patient, type Recommendation } from "@/flows/_mocks/orchestrator";
import { Shell } from "./Shell";
import { SearchField } from "./SearchField";
import { TrackBadges } from "./Clinical";
import { FilterSelect, ListFeedback, WorkspaceHeading, type ListState } from "./WorkspacePrimitives";
import { careTracks } from "@/flows/_mocks/workspace";
import { defaultWorkspaceFilters, type WorkspaceFilters } from "./workspace-navigation";
import { recommendationDecisionLabel, type RecommendationDecisions } from "./recommendation-navigation";

type Props = { items?: Recommendation[]; people?: Patient[]; decisions?: RecommendationDecisions; initialFilters?: WorkspaceFilters; state?: ListState; appBase?: string; onReview?: (patientId: string, recommendationId: string, filters: WorkspaceFilters) => void };
export function RecommendationsListView({ items = recommendations, people = patients, decisions = {}, initialFilters = defaultWorkspaceFilters, state = "ready", appBase = "", onReview }: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [listState, setListState] = useState(state);
  const choose = (field: keyof WorkspaceFilters, value: string) => setFilters((current) => ({ ...current, [field]: value }));
  const reset = () => { setFilters(defaultWorkspaceFilters); setListState("ready"); };
  const filtered = items.filter((item) => {
    const patient = people.find((person) => person.id === item.patientId);
    return patient && `${patient.name} ${item.title} ${item.signal}`.toLocaleLowerCase().includes(filters.query.toLocaleLowerCase().trim())
      && (filters.track === "all" || patient.tracks.includes(filters.track))
      && (filters.status === "all" || (filters.status === "reviewed" ? Boolean(decisions[item.id]) : !decisions[item.id]));
  });
  const pending = items.filter((item) => !decisions[item.id]).length;
  const showReviewed = filters.status === "pending" && pending === 0 && Object.keys(decisions).length > 0 && !filters.query && filters.track === "all";
  return <Shell section="recommendations" appBase={appBase}>
    <WorkspaceHeading title="Recommendations"><Text variant="muted">{pending} pending review</Text></WorkspaceHeading>
    <div className="clinical-panel mb-5 grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_180px_200px] sm:items-end sm:p-6"><div><Label htmlFor="recommendations-search" className="sr-only">Search recommendations</Label><SearchField id="recommendations-search" placeholder="Search patient or recommendation" value={filters.query} onValueChange={(value) => choose("query", value)} /></div><FilterSelect label="Care track" value={filters.track} onChange={(value) => choose("track", value)} options={[{ value: "all", label: "All tracks" }, ...careTracks.map((value) => ({ value, label: value }))]} /><FilterSelect label="Status" value={filters.status} onChange={(value) => choose("status", value)} options={[{ value: "pending", label: "Pending review" }, { value: "reviewed", label: "Reviewed" }, { value: "all", label: "All statuses" }]} /></div>
    {listState !== "ready" || !filtered.length ? <div className="clinical-panel"><ListFeedback state={listState === "ready" ? "empty" : listState} empty={filters.status === "pending" && !filters.query ? "No recommendations awaiting review" : "No matching recommendations"} hideEmptyAction={!items.length} emptyActionLabel={showReviewed ? "Show reviewed" : "Clear filters"} onReset={() => showReviewed ? choose("status", "reviewed") : reset()} /></div> : <div className="space-y-5">{filtered.map((item) => {
      const patient = people.find((person) => person.id === item.patientId)!;
      const action = decisions[item.id];
      return <article key={item.id} className="clinical-panel grid overflow-hidden xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><section className="min-w-0 space-y-4 p-5 sm:p-6"><div className="flex flex-wrap items-center gap-3"><Heading level={4} as="h2">{patient.name}</Heading><TrackBadges tracks={patient.tracks} /><Badge variant="outline" className={action && action.decision !== "dismissed" ? "bg-success-soft text-success" : ""}>{recommendationDecisionLabel(action?.decision ?? "pending")}</Badge></div><Heading level={3} as="h3" className="break-words">{item.title}</Heading><Text className="break-words">{action?.text ?? item.text}</Text><Text variant="muted" className="break-words">{item.explanation}</Text>{action && <Text variant="small">{action.author} · {action.date}</Text>}<Button variant="outline" onClick={() => onReview ? onReview(patient.id, item.id, filters) : window.location.assign(`${appBase}/patients/${patient.id}/from/recommendations/recommendations/${item.id}`)}>{action ? "View decision" : "Review recommendation"}<ArrowUpRight className="size-4" /></Button></section><aside className="min-w-0 bg-muted/40 p-5 sm:p-6"><Text variant="small">Referenced signal</Text><Text className="mt-3 font-medium break-words">{item.signal}</Text><Text variant="small" className="mt-3">{item.signalDate}</Text></aside></article>;
    })}</div>}
  </Shell>;
}
