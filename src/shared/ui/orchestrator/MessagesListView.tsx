/** WBS: Orchestrator (FULL), rows 114. Interactive presentation on mock records. */
import { useState } from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/shared/ui/typography";
import { patients, type Patient } from "@/flows/_mocks/orchestrator";
import { patientRecords, type PatientRecord } from "@/flows/_mocks/patient-records";
import { mockClinician } from "@/flows/_mocks/clinician";
import { Shell } from "./Shell";
import { PatientMessagesPanel } from "./PatientMessagesPanel";
import { SearchField } from "./SearchField";
import { ListFeedback, WorkspaceHeading, type ListState } from "./WorkspacePrimitives";

type Props = { people?: Patient[]; records?: PatientRecord[]; appBase?: string; state?: ListState; sendOutcome?: "success" | "failure"; initialQuery?: string; initialPatientId?: string; onPatientOpen?: (id: string, records: PatientRecord[], query: string) => void; onMessagePreview?: (record: PatientRecord) => void };
export function MessagesListView({ people = patients, records = patientRecords, appBase = "", state = "ready", sendOutcome = "success", initialQuery = "", initialPatientId, onPatientOpen, onMessagePreview }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<string | null>(initialPatientId ?? null);
  const [logs, setLogs] = useState(records);
  const [listState, setListState] = useState(state);
  const conversations = logs.filter((record) => record.messages.length && people.find((patient) => patient.id === record.patientId)?.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).sort((a, b) => (b.messages.at(-1)?.timestamp ?? 0) - (a.messages.at(-1)?.timestamp ?? 0));
  const active = logs.find((record) => record.patientId === selected);
  const person = people.find((patient) => patient.id === selected);
  return <Shell section="messages" appBase={appBase}><WorkspaceHeading title="Messages" /><div className="grid items-start gap-5 lg:grid-cols-[340px_minmax(0,1fr)]"><section className={`clinical-panel overflow-hidden ${selected ? "hidden lg:block" : ""}`}><div className="p-5"><Label htmlFor="conversation-search" className="sr-only">Search conversations</Label><SearchField id="conversation-search" placeholder="Search patient" value={query} onValueChange={setQuery} /></div>{listState !== "ready" || !conversations.length ? <ListFeedback state={listState === "ready" ? "empty" : listState} hideEmptyAction={!query.trim()} empty="No conversations found" onReset={() => { setQuery(""); setListState("ready"); }} /> : <div className="max-h-[calc(100dvh-18rem)] min-h-64 divide-y overflow-y-auto">{conversations.map((record) => {
    const patient = people.find((item) => item.id === record.patientId)!;
    const latest = record.messages.at(-1)!;
    return <Button key={record.patientId} variant="ghost" className={`h-auto w-full flex-col items-start gap-2 rounded-none p-5 text-left whitespace-normal ${selected === record.patientId ? "bg-accent" : ""}`} onClick={() => setSelected(record.patientId)}><Text className="font-medium">{patient.name}</Text><Text variant="muted" className="line-clamp-2 font-normal break-words">{latest.text}</Text><Text variant="small" className="font-normal">{latest.date}</Text></Button>;
  })}</div>}</section><div className="min-w-0">{person && active ? <><Button variant="ghost" className="mb-3 lg:hidden" onClick={() => setSelected(null)}><ArrowLeft className="size-4" />Conversations</Button><PatientMessagesPanel key={person.id} title={person.name} patient={person} messages={active.messages} onPatientOpen={() => onPatientOpen ? onPatientOpen(person.id, logs, query) : window.location.assign(`${appBase}/patients/${person.id}/from/messages#communications`)} onMessageSend={(text) => { if (sendOutcome === "failure") return false; const next: PatientRecord = { ...active, messages: [...active.messages, { id: `message-${Date.now()}`, direction: "outgoing", text, date: "Just now", timestamp: Date.now(), author: mockClinician.name }] }; setLogs((current) => current.map((record) => record.patientId === person.id ? next : record)); onMessagePreview?.(next); toast.success("Message sent."); return true; }} /></> : <div className="clinical-panel flex min-h-96 flex-col items-center justify-center gap-4 p-6 text-center"><MessageSquare className="size-8 text-muted-foreground" /><Heading level={3} as="h2">Choose a conversation</Heading><Text variant="muted">Select a patient to read and reply.</Text></div>}</div></div></Shell>;
}
