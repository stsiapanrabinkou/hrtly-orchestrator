/** WBS: Orchestrator (FULL), rows 15–20. Interactive presentation on mock records. */
import { useState } from "react";
import { ArrowDownUp, Download, Plus, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Text } from "@/shared/ui/typography";
import { registryPatients, careTracks, type RegistryPatient } from "@/flows/_mocks/workspace";
import { Shell } from "./Shell";
import { TrackBadges } from "./Clinical";
import { SearchField } from "./SearchField";
import { WorkspaceHeading, FilterSelect, ListPagination, ListFeedback, type ListState } from "./WorkspacePrimitives";
import { defaultWorkspaceFilters, csvPreview, downloadPreview, type WorkspaceFilters } from "./workspace-navigation";

type Props = {
  items?: RegistryPatient[]; initialFilters?: WorkspaceFilters; appBase?: string; state?: ListState;
  trackPreviews?: Record<string, string[]>;
  onPatientOpen?: (id: string, filters: WorkspaceFilters) => void;
  onEnrollmentOpen?: () => void;
  onTrackPreview?: (assignments: Record<string, string[]>) => void;
};
export function PatientsListView({ items = registryPatients, initialFilters = defaultWorkspaceFilters, appBase = "", state = "ready", onPatientOpen, onEnrollmentOpen, onTrackPreview, trackPreviews = {} }: Props) {
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [assignments, setAssignments] = useState(trackPreviews);
  const [reassign, setReassign] = useState(false);
  const [target, setTarget] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">(initialFilters.sort === "desc" ? "desc" : "asc");
  const [listState, setListState] = useState(state);
  const choose = (field: keyof WorkspaceFilters, value: string) => { setFilters((current) => ({ ...current, [field]: value, page: 1 })); setSelected([]); };
  const reset = () => { setFilters(defaultWorkspaceFilters); setSelected([]); setListState("ready"); };
  const tracksFor = (item: RegistryPatient) => assignments[item.patient.id] ?? item.patient.tracks;
  const filtered = items.filter((item) => {
    const { patient, record } = item;
    const query = filters.query.trim().toLocaleLowerCase();
    return (!query || `${patient.name} ${record.profile.medicareId === "Not recorded" ? "" : record.profile.medicareId}`.toLocaleLowerCase().includes(query))
      && (filters.track === "all" || tracksFor(item).includes(filters.track))
      && (filters.risk === "all" || item.riskTier === filters.risk)
      && (filters.outcome === "all" || item.outcomeCategory === filters.outcome)
      && (filters.hub === "all" || record.profile.hub === filters.hub)
      && (filters.team === "all" || record.team.some((member) => member.userId === filters.team));
  }).sort((a, b) => a.patient.name.localeCompare(b.patient.name) * (sort === "asc" ? 1 : -1));
  const page = Math.min(filters.page, Math.max(1, Math.ceil(filtered.length / 12)));
  const rows = filtered.slice((page - 1) * 12, page * 12);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const metric = (item: RegistryPatient, label: string) => { const value = item.patient.metrics.find((metric) => metric.label === label)?.value; return !value || value === "Not applicable" ? "N/A" : value; };
  const openPatient = (id: string) => onPatientOpen ? onPatientOpen(id, { ...filters, page, sort }) : window.location.assign(`${appBase}/patients/${id}/from/patients`);
  const exportCohort = () => {
    downloadPreview("care-patients.csv", csvPreview([
      ["Name", "Medicare ID", "Date of birth", "Tracks", "Risk tier", "Blood pressure", "HbA1c", "PHQ-9"],
      ...filtered.map((item) => [item.patient.name, item.record.profile.medicareId, item.patient.dob, tracksFor(item).join("; "), item.riskTier, metric(item, "Blood pressure"), metric(item, "HbA1c"), metric(item, "PHQ-9")]),
    ]));
    toast.success("Patient list exported.");
  };
  const team = [...new Map(items.flatMap((item) => item.record.team).map((member) => [member.userId, member])).values()];
  return (
    <Shell section="patients" appBase={appBase}>
      <WorkspaceHeading title="Patients"><Button variant="outline" disabled={!filtered.length} onClick={exportCohort}><Download className="size-4" />Export CSV</Button><Button onClick={() => onEnrollmentOpen ? onEnrollmentOpen() : window.location.assign(`${appBase}/patients/enroll`)}><Plus className="size-4" />Enroll patient</Button></WorkspaceHeading>
      <div className="clinical-panel overflow-hidden">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="max-w-xl"><Label htmlFor="registry-search" className="sr-only">Search patients</Label><SearchField id="registry-search" placeholder="Search name or Medicare ID" value={filters.query} onValueChange={(value) => choose("query", value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <FilterSelect label="Care track" value={filters.track} onChange={(value) => choose("track", value)} options={[{ value: "all", label: "All tracks" }, ...careTracks.map((value) => ({ value, label: value }))]} />
            <FilterSelect label="Risk tier" value={filters.risk} onChange={(value) => choose("risk", value)} options={[{ value: "all", label: "All risk tiers" }, ...["High", "Moderate", "Low", "Not assessed"].map((value) => ({ value, label: value }))]} />
            <FilterSelect label="Outcome" value={filters.outcome} onChange={(value) => choose("outcome", value)} options={[{ value: "all", label: "All outcomes" }, ...["On track", "At risk", "Met target", "Cannot determine"].map((value) => ({ value, label: value }))]} />
            <FilterSelect label="Hub" value={filters.hub} onChange={(value) => choose("hub", value)} options={[{ value: "all", label: "All locations" }, ...[...new Set(items.map((item) => item.record.profile.hub))].map((value) => ({ value, label: value }))]} />
            <FilterSelect label="Care team" value={filters.team} onChange={(value) => choose("team", value)} options={[{ value: "all", label: "All care teams" }, ...team.map((member) => ({ value: member.userId, label: member.name }))]} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3"><Text variant="small">{filtered.length} patients</Text><Button variant="ghost" onClick={reset}>Clear filters</Button></div>
        </div>
        {selected.length > 0 && <div className="flex flex-wrap items-center gap-3 bg-accent px-5 py-3"><Text className="font-medium">{selected.length} selected</Text><Button variant="outline" onClick={() => { setTarget(""); setReassign(true); }}>Reassign track</Button><Button variant="ghost" onClick={() => setSelected([])}>Clear selection</Button></div>}
        {listState !== "ready" || !filtered.length ? <ListFeedback state={listState === "ready" ? "empty" : listState} hideEmptyAction={!items.length} empty={items.length ? "No patients match these filters" : "No patients enrolled yet"} onReset={reset} /> : (
          <>
            <div className="hidden lg:block"><Table><TableHeader><TableRow><TableHead className="w-12 pl-5"><Checkbox aria-label="Select current page" checked={rows.length > 0 && rows.every((item) => selected.includes(item.patient.id))} onCheckedChange={(checked) => setSelected((current) => checked ? [...new Set([...current, ...rows.map((item) => item.patient.id)])] : current.filter((id) => !rows.some((item) => item.patient.id === id)))} /></TableHead><TableHead><Button variant="ghost" className="-ml-3" onClick={() => setSort(sort === "asc" ? "desc" : "asc")}>Patient<ArrowDownUp className="size-3" /></Button></TableHead><TableHead>Medicare ID</TableHead><TableHead>Date of birth</TableHead><TableHead>Tracks</TableHead><TableHead>Risk</TableHead><TableHead>BP (mmHg)</TableHead><TableHead>HbA1c (%)</TableHead><TableHead>PHQ-9</TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.patient.id}><TableCell className="pl-5"><Checkbox checked={selected.includes(item.patient.id)} onCheckedChange={() => toggle(item.patient.id)} aria-label={`Select ${item.patient.name}`} /></TableCell><TableCell><Button variant="link" className="h-auto p-0 font-medium" onClick={() => openPatient(item.patient.id)}>{item.patient.name}</Button></TableCell><TableCell className="text-muted-foreground">{item.record.profile.medicareId}</TableCell><TableCell>{item.patient.dob}</TableCell><TableCell><TrackBadges tracks={tracksFor(item)} /></TableCell><TableCell><Badge variant="outline" className={item.riskTier === "High" ? "bg-danger-soft text-danger" : item.riskTier === "Moderate" ? "bg-warning-soft text-warning" : ""}>{item.riskTier}</Badge></TableCell><TableCell>{metric(item, "Blood pressure")}</TableCell><TableCell>{metric(item, "HbA1c")}</TableCell><TableCell>{metric(item, "PHQ-9")}</TableCell></TableRow>)}</TableBody></Table></div>
            <div className="divide-y lg:hidden">{rows.map((item) => <article key={item.patient.id} className="space-y-4 p-5"><div className="flex items-start gap-3"><Checkbox aria-label={`Select ${item.patient.name}`} checked={selected.includes(item.patient.id)} onCheckedChange={() => toggle(item.patient.id)} /><div className="min-w-0 flex-1"><Button variant="link" className="h-auto p-0 text-left whitespace-normal" onClick={() => openPatient(item.patient.id)}>{item.patient.name}<ArrowUpRight className="size-4" /></Button><Text variant="small" className="mt-1">DOB {item.patient.dob} · {item.riskTier} risk</Text></div></div><TrackBadges tracks={tracksFor(item)} /><div className="grid grid-cols-3 gap-3"><div><Text variant="small">BP</Text><Text className="mt-1">{metric(item, "Blood pressure")}</Text></div><div><Text variant="small">HbA1c</Text><Text className="mt-1">{metric(item, "HbA1c")}</Text></div><div><Text variant="small">PHQ-9</Text><Text className="mt-1">{metric(item, "PHQ-9")}</Text></div></div><Text variant="small">Medicare ID: {item.record.profile.medicareId}</Text></article>)}</div>
            <ListPagination page={page} total={filtered.length} onChange={(next) => setFilters((current) => ({ ...current, page: next }))} />
          </>
        )}
      </div>
      <Dialog open={reassign} onOpenChange={setReassign}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Reassign care track</DialogTitle><DialogDescription>{selected.length} selected patients</DialogDescription></DialogHeader><div className="space-y-4 py-2"><Text>The selected track will replace their current track assignments.</Text><div className="space-y-2"><Label htmlFor="reassign-track">Care track *</Label><Select value={target} onValueChange={setTarget}><SelectTrigger id="reassign-track" className="w-full"><SelectValue placeholder="Select track" /></SelectTrigger><SelectContent>{careTracks.map((track) => <SelectItem key={track} value={track}>{track}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setReassign(false)}>Cancel</Button><Button disabled={!target} onClick={() => { const next = { ...assignments, ...Object.fromEntries(selected.map((id) => [id, [target]])) }; setAssignments(next); onTrackPreview?.(next); setReassign(false); setSelected([]); toast.success("Care tracks reassigned."); }}>Reassign track</Button></DialogFooter></DialogContent></Dialog>
    </Shell>
  );
}
