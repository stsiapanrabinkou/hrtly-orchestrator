import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/shared/ui/typography";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import { Flag } from "./Clinical";
import { Detail, Empty } from "./RecordPanels";

type Props = {
  escalations: PatientRecord["escalations"];
};

export function PatientEscalationsPanel({ escalations }: Props) {
  const alerts = [...escalations]
    .sort((a, b) => b.timestamp - a.timestamp);
  return (
    <div className="space-y-5">
      {!escalations.length && <div className="clinical-panel p-5 sm:p-6"><Empty>No open escalations.</Empty></div>}
      <ol className="space-y-5">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <article className="clinical-panel grid overflow-hidden xl:grid-cols-[1.4fr_1fr]">
              <section className="min-w-0 p-5 sm:p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {alert.severity === "red" || alert.severity === "yellow"
                    ? <Flag flag={alert.severity} />
                    : <Badge variant="outline">Severity not recorded</Badge>}
                  {alert.status && <Badge variant="outline">{alert.status}</Badge>}
                </div>
                <Heading level={3} as="h2" className="break-words">{alert.title}</Heading>
                <Text variant="small" className="mt-2">{alert.date}</Text>
                <div className="mt-6">
                  <Heading level={4} as="h3">Recommended action</Heading>
                  <Text className="mt-3 whitespace-pre-wrap break-words">{alert.action || "No recommended action recorded."}</Text>
                </div>
                <dl className="mt-6"><Detail label="Escalation ID" value={alert.id} /></dl>
              </section>
              <div className="flex min-w-0 flex-col divide-y divide-border border-t border-border xl:border-t-0 xl:border-l">
                <section className="flex-1 p-5 sm:p-6">
                  <Heading level={4} as="h3">Clinician note</Heading>
                  {alert.note ? (
                    <>
                      <Text className="mt-3 whitespace-pre-wrap break-words">{alert.note}</Text>
                      <Text variant="small" className="mt-3">{alert.author}{alert.noteDate ? ` · ${alert.noteDate}` : ""}</Text>
                    </>
                  ) : <Text variant="muted" className="mt-3">No clinician note recorded.</Text>}
                </section>
                <section className="p-5 sm:p-6">
                  <div className="flex items-center gap-2"><Bell className="size-4 text-muted-foreground" /><Heading level={4} as="h3">Notifications</Heading></div>
                  <Text variant="muted" className="mt-3 break-words">{alert.delivery}</Text>
                </section>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
