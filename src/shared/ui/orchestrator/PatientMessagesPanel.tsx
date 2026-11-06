import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Text } from "@/shared/ui/typography";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import type { Patient } from "@/flows/_mocks/orchestrator";
import { Empty, Panel } from "./RecordPanels";

type Props = { patient: Patient; messages: PatientRecord["messages"]; onMessageSend: (text: string) => boolean; onPatientOpen?: () => void; title?: string };
export function PatientMessagesPanel({ patient, messages, onMessageSend, onPatientOpen, title = "Patient messages" }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const feed = useRef<HTMLOListElement>(null);
  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
  useEffect(() => {
    if (feed.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [messages.length]);
  return (
      <Panel title={title} action={onPatientOpen ? <Button variant="outline" onClick={onPatientOpen}>View patient<ArrowUpRight className="size-4" /></Button> : undefined}>
        {!messages.length ? <Empty>No messages yet.</Empty> : (
          <ol ref={feed} role="log" aria-label={`Messages with ${patient.name}`} aria-live="polite" aria-relevant="additions" tabIndex={0} className="max-h-[32rem] min-h-64 space-y-5 overflow-y-auto overscroll-contain rounded-lg p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {sortedMessages.map((item) => (
              <li key={item.id} className={`w-fit max-w-[90%] sm:max-w-[85%] ${item.direction === "outgoing" ? "ml-auto" : "mr-auto"}`}>
                <Text variant="small" className={`mb-2 font-medium ${item.direction === "outgoing" ? "text-right" : ""}`}>{item.author}</Text>
                <div className={`rounded-xl px-4 py-3 ${item.direction === "outgoing" ? "bg-accent" : "bg-muted"}`}>
                  <Text className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{item.text}</Text>
                </div>
                <Text variant="small" className={`mt-2 ${item.direction === "outgoing" ? "text-right" : ""}`}>{item.date}</Text>
              </li>
            ))}
          </ol>
        )}
        <form className="mt-6 space-y-3" onSubmit={(event) => {
          event.preventDefault();
          const text = message.trim();
          if (!text) return;
          if (onMessageSend(text)) { setMessage(""); setError(""); }
          else setError("Message could not be sent. Your text has been kept. Try again.");
        }}>
          <Label htmlFor="patient-reply">Message</Label>
          <Textarea id="patient-reply" value={message} maxLength={4000} aria-invalid={Boolean(error)} aria-describedby={error ? "message-error" : undefined} onChange={(event) => { setMessage(event.target.value); setError(""); }} className="min-h-28" />
          {error && <Text id="message-error" role="alert" className="text-destructive">{error}</Text>}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Text variant="small">{message.length.toLocaleString("en-US")} / 4,000</Text>
            <Button type="submit" disabled={!message.trim()}><Send className="size-4" />Send message</Button>
          </div>
        </form>
      </Panel>
  );
}
