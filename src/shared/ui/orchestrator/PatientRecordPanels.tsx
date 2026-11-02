import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Heading, Text } from "@/shared/ui/typography";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import type { Patient } from "@/flows/_mocks/orchestrator";

type Action =
  | "goal"
  | "activity"
  | "team"
  | "note"
  | "order"
  | "visit"
  | "hie"
  | "need"
  | "referral"
  | "message"
  | "remove";
type Draft = {
  action: Action;
  id?: string;
  title: string;
  text: string;
  extra: string;
  category: string;
  contacts: string[];
  collection?: "goals" | "activities" | "team";
};
export type PatientActionPreview = {
  patientId: string;
  action: Action;
  values: Omit<Draft, "action">;
};
type Props = {
  patient: Patient;
  record: PatientRecord;
  actingUser: string;
  returnView: string;
  appBase: string;
  referralPreviewOutcome?: "success" | "failure";
  onRecordPreview: (update: (current: PatientRecord) => PatientRecord) => void;
  onActionPreview?: (action: PatientActionPreview) => void;
};

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="clinical-panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Heading level={3} as="h2">
            {title}
          </Heading>
          {description && (
            <Text variant="muted" className="mt-1 max-w-2xl">
              {description}
            </Text>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <Text variant="muted" className="rounded-lg border border-dashed p-5">
      {children}
    </Text>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

const actionNames: Record<Action, string> = {
  goal: "Care goal",
  activity: "Care activity",
  team: "Care team member",
  note: "Clinical note",
  order: "Document an order",
  visit: "Complete visit documentation",
  hie: "Send update to PCP",
  need: "Social need",
  referral: "Create social referral",
  message: "Reply to patient",
  remove: "Remove from care plan",
};

export function PatientRecordPanels({
  patient,
  record,
  actingUser,
  returnView,
  appBase,
  referralPreviewOutcome = "success",
  onRecordPreview: setPreview,
  onActionPreview,
}: Props) {
  const preview = record;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState("");
  const [timelineType, setTimelineType] = useState("All events");
  const [timelineQuery, setTimelineQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [nextPreviewId, setNextPreviewId] = useState(1);
  const [referralResult, setReferralResult] = useState<
    "success" | "failure" | null
  >(null);
  const open = (action: Action, values: Partial<Draft> = {}) => {
    setDraft({
      action,
      title: "",
      text: "",
      extra: "",
      category:
        action === "order"
          ? "Laboratory"
          : action === "team"
            ? "Physician"
            : action === "need"
              ? "Not assessed"
              : "Transportation",
      contacts: [],
      ...values,
    });
    setError("");
    setReferralResult(null);
  };
  const update = (values: Partial<Draft>) =>
    setDraft((current) => current && { ...current, ...values });
  const author = actingUser;
  const stamp = "Session preview · not saved";
  const events = preview.timeline.filter(
    (event) =>
      (timelineType === "All events" || event.type === timelineType) &&
      `${event.title} ${event.detail} ${event.source}`
        .toLowerCase()
        .includes(timelineQuery.toLowerCase()),
  );
  const apply = () => {
    if (!draft) return;
    const { action, ...values } = draft;
    const text = draft.text.trim();
    if (action === "referral" && !draft.contacts.length) {
      setError("Select at least one contact detail to share.");
      return;
    }
    if (
      ["note", "order", "visit", "referral", "message"].includes(action) &&
      !text
    ) {
      setError("Enter the required details before continuing.");
      return;
    }
    if (
      ["goal", "activity", "team"].includes(action) &&
      (!draft.title.trim() ||
        (action !== "team" && !draft.extra.trim()) ||
        (action === "goal" && !text))
    ) {
      setError("Complete all required fields.");
      return;
    }
    onActionPreview?.({ patientId: patient.id, action, values });
    if (
      action === "referral" &&
      referralPreviewOutcome === "failure" &&
      referralResult !== "failure"
    ) {
      setReferralResult("failure");
      return;
    }
    const id = draft.id ?? `preview-${action}-${nextPreviewId}`;
    setNextPreviewId((current) => current + 1);
    if (action === "goal") {
      const goal = {
        id,
        title: draft.title.trim(),
        target: text,
        owner: draft.extra.trim(),
      };
      setPreview((current) => ({
        ...current,
        goals: draft.id
          ? current.goals.map((item) => (item.id === id ? goal : item))
          : [...current.goals, goal],
      }));
    }
    if (action === "activity") {
      const activity = {
        id,
        title: draft.title.trim(),
        owner: draft.extra.trim(),
      };
      setPreview((current) => ({
        ...current,
        activities: draft.id
          ? current.activities.map((item) => (item.id === id ? activity : item))
          : [...current.activities, activity],
      }));
    }
    if (action === "team") {
      const member = { id, name: draft.title.trim(), role: draft.category };
      setPreview((current) => ({
        ...current,
        team: draft.id
          ? current.team.map((item) => (item.id === id ? member : item))
          : [...current.team, member],
      }));
    }
    if (action === "remove" && draft.collection) {
      const collection = draft.collection;
      setPreview((current) => ({
        ...current,
        [collection]: current[collection].filter(
          (item) => item.id !== draft.id,
        ),
      }));
    }
    if (action === "note")
      setPreview((current) => ({
        ...current,
        notes: [{ id, text, author, date: stamp }, ...current.notes],
      }));
    if (action === "order")
      setPreview((current) => ({
        ...current,
        orders: [
          { id, type: draft.category, detail: text, date: stamp },
          ...current.orders,
        ],
      }));
    if (action === "visit")
      setPreview((current) => ({
        ...current,
        timeline: [
          {
            id: `visit-preview-${id}`,
            date: stamp,
            sortDate: "preview",
            type: "Visit",
            title: `${draft.title} · completed in preview`,
            detail: text,
            source: author,
          },
          ...current.timeline.filter(
            (event) => event.id !== id && event.id !== `visit-preview-${id}`,
          ),
        ],
        visits: current.visits.map((visit) =>
          visit.id === draft.id
            ? { ...visit, status: "Completed · preview", summary: text }
            : visit,
        ),
      }));
    if (action === "need")
      setPreview((current) => ({
        ...current,
        needs: current.needs.map((need) =>
          need.category === draft.title
            ? {
                ...need,
                status: draft.category,
                notes: text,
                captured: stamp,
                author,
              }
            : need,
        ),
      }));
    if (action === "referral") {
      setPreview((current) => ({
        ...current,
        referrals: [
          ...current.referrals,
          {
            id: `PREVIEW-${patient.displayId}-${current.referrals.length + 1}`,
            category: draft.category,
            reason: text,
            status: "Submission preview · not sent",
          },
        ],
      }));
      setReferralResult("success");
      return;
    }
    if (action === "message") {
      setPreview((current) => ({
        ...current,
        messages: [
          ...current.messages,
          { id, direction: "outgoing", text, date: stamp, author },
        ],
      }));
      setMessage("");
    }
    setNotice(
      action === "hie"
        ? "PCP update preview prepared. No message was sent to an EHR."
        : `${actionNames[action]} preview updated. Changes are not saved or sent.`,
    );
    setDraft(null);
  };
  const editControls = (
    collection: "goals" | "activities" | "team",
    id: string,
    title: string,
    edit: () => void,
  ) => (
    <div className="flex shrink-0 gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${title}`}
        onClick={edit}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Remove ${title}`}
        onClick={() => open("remove", { id, title, collection })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
  return (
    <>
      {notice && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-accent p-4"
        >
          <Text>{notice}</Text>
          <Button variant="ghost" size="sm" onClick={() => setNotice("")}>
            Dismiss
          </Button>
        </div>
      )}
      <TabsContent value="timeline" className="space-y-5">
        <Panel
          title="Clinical timeline"
          description="Recorded events, newest first. Clinical observations and coaching messages are read-only."
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="timeline-search" className="sr-only">
                Search clinical timeline
              </Label>
              <Input
                id="timeline-search"
                className="h-10"
                placeholder="Search events, values or source…"
                value={timelineQuery}
                onChange={(event) => setTimelineQuery(event.target.value)}
              />
            </div>
            <Select value={timelineType} onValueChange={setTimelineType}>
              <SelectTrigger aria-label="Event type" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "All events",
                  "Vital sign",
                  "Lab result",
                  "Patient report",
                  "Visit",
                  "Coaching message",
                ].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!events.length ? (
            <div className="space-y-3">
              <Empty>
                {preview.timeline.length
                  ? "No events match these filters."
                  : "No clinical events recorded for this patient."}
              </Empty>
              {preview.timeline.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTimelineQuery("");
                    setTimelineType("All events");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <ol className="space-y-0">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="relative grid gap-3 border-l-2 border-border pb-7 pl-6 last:pb-0 sm:grid-cols-[170px_1fr]"
                >
                  <div className="absolute -left-1.5 top-1 size-2.5 rounded-full border-2 border-background bg-primary" />
                  <div>
                    <Text variant="small">{event.date}</Text>
                    <Badge variant="outline" className="mt-2">
                      {event.type}
                    </Badge>
                  </div>
                  <div>
                    <Heading level={4} as="h3">
                      {event.title}
                    </Heading>
                    <Text className="mt-1 whitespace-pre-wrap break-words">
                      {event.detail}
                    </Text>
                    <Text variant="small" className="mt-2">
                      {event.source}
                    </Text>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </TabsContent>
      <TabsContent value="escalations">
        <Panel
          title="Escalation log"
          description="Existing open alerts, recommended actions and clinician notes. Alerts cannot be created, resolved or changed from this view."
        >
          {!record.escalations.length ? (
            <Empty>
              No open clinical alerts recorded. Monitoring gaps are shown
              separately in Overview.
            </Empty>
          ) : (
            <div className="space-y-4">
              {record.escalations.map((alert) => (
                <article key={alert.id} className="rounded-lg border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Heading level={4} as="h3">
                      {alert.title}
                    </Heading>
                    <Badge variant="outline">Open · read-only</Badge>
                  </div>
                  <Text variant="small" className="mt-2">
                    {alert.date} · {alert.id}
                  </Text>
                  <Text className="mt-4 font-medium">Recommended action</Text>
                  <Text className="mt-1">{alert.action}</Text>
                  <div className="mt-4 rounded-lg bg-muted/40 p-4">
                    <Text className="font-medium">Clinician note</Text>
                    <Text className="mt-1">{alert.note}</Text>
                    <Text variant="small" className="mt-2">
                      {alert.author}
                    </Text>
                  </div>
                  <Text
                    variant="small"
                    className="mt-4 inline-flex items-center gap-2"
                  >
                    <ShieldCheck className="size-4 shrink-0" />
                    {alert.delivery}
                  </Text>
                </article>
              ))}
            </div>
          )}
        </Panel>
      </TabsContent>
      <TabsContent value="care" className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4">
          <div>
            <Text className="font-medium">Care plan · {patient.name}</Text>
            <Text variant="small" className="mt-1">
              Goals, interventions and the people responsible for care.
            </Text>
          </div>
          <Button
            variant="outline"
            disabled={record.profile.pcp === "Not recorded"}
            onClick={() => open("hie")}
          >
            <ArrowUpRight className="size-4" />
            Send update to PCP
          </Button>
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <Panel
            title="Care goals"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => open("goal", { extra: author })}
              >
                <Plus className="size-4" />
                Add goal
              </Button>
            }
          >
            {!preview.goals.length ? (
              <Empty>No care goals recorded.</Empty>
            ) : (
              <div className="divide-y">
                {preview.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Heading level={4} as="h3">
                        {goal.title}
                      </Heading>
                      <Text className="mt-2 break-words">
                        Target: {goal.target}
                      </Text>
                      <Text variant="small" className="mt-2">
                        Responsible: {goal.owner}
                      </Text>
                    </div>
                    {editControls("goals", goal.id, goal.title, () =>
                      open("goal", {
                        id: goal.id,
                        title: goal.title,
                        text: goal.target,
                        extra: goal.owner,
                      }),
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel
            title="Activities & interventions"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => open("activity", { extra: author })}
              >
                <Plus className="size-4" />
                Add activity
              </Button>
            }
          >
            {!preview.activities.length ? (
              <Empty>No activities recorded.</Empty>
            ) : (
              <div className="divide-y">
                {preview.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Text className="font-medium break-words">
                        {activity.title}
                      </Text>
                      <Text variant="small" className="mt-2">
                        Responsible: {activity.owner}
                      </Text>
                    </div>
                    {editControls(
                      "activities",
                      activity.id,
                      activity.title,
                      () =>
                        open("activity", {
                          id: activity.id,
                          title: activity.title,
                          extra: activity.owner,
                        }),
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <Panel
          title="Care team"
          action={
            <Button variant="outline" size="sm" onClick={() => open("team")}>
              <Plus className="size-4" />
              Add member
            </Button>
          }
        >
          {!preview.team.length ? (
            <Empty>No care team assigned.</Empty>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {preview.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start justify-between gap-2 rounded-lg border p-4"
                >
                  <div>
                    <Text className="font-medium">{member.name}</Text>
                    <Text variant="small" className="mt-1">
                      {member.role}
                    </Text>
                  </div>
                  {editControls("team", member.id, member.name, () =>
                    open("team", {
                      id: member.id,
                      title: member.name,
                      category: member.role,
                    }),
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <Panel
            title="Clinical notes & decisions"
            description="Free-text notes are read-only after saving."
            action={
              <Button variant="outline" size="sm" onClick={() => open("note")}>
                <Plus className="size-4" />
                Add note
              </Button>
            }
          >
            {!preview.notes.length ? (
              <Empty>No clinical notes recorded.</Empty>
            ) : (
              <div className="space-y-4">
                {preview.notes.map((note) => (
                  <article key={note.id} className="rounded-lg bg-muted/40 p-4">
                    <Text className="whitespace-pre-wrap break-words">
                      {note.text}
                    </Text>
                    <Text variant="small" className="mt-3">
                      {note.author} · {note.date}
                    </Text>
                  </article>
                ))}
              </div>
            )}
          </Panel>
          <Panel
            title="Lab & device orders"
            description="Documented orders only. External fulfillment and tracking are outside this workflow."
            action={
              <Button variant="outline" size="sm" onClick={() => open("order")}>
                <Plus className="size-4" />
                Document order
              </Button>
            }
          >
            {!preview.orders.length ? (
              <Empty>No orders documented.</Empty>
            ) : (
              <div className="space-y-4">
                {preview.orders.map((order) => (
                  <article key={order.id} className="rounded-lg border p-4">
                    <Badge variant="outline">{order.type}</Badge>
                    <Text className="mt-2 whitespace-pre-wrap break-words">
                      {order.detail}
                    </Text>
                    <Text variant="small" className="mt-2">
                      {order.date} · linked to this patient and care plan
                    </Text>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <Panel
          title="Visit documentation"
          description="Document outcomes of existing visits. Reminders use the recorded visit time and configured channel."
        >
          {!preview.visits.length ? (
            <Empty>No visits recorded.</Empty>
          ) : (
            <div className="space-y-4">
              {preview.visits.map((visit) => (
                <article key={visit.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Heading level={4} as="h3">
                        {visit.type}
                      </Heading>
                      <Text variant="small" className="mt-1">
                        {visit.date}
                      </Text>
                    </div>
                    <Badge variant="outline">{visit.status}</Badge>
                  </div>
                  {visit.summary && (
                    <Text className="mt-3 whitespace-pre-wrap break-words">
                      {visit.summary}
                    </Text>
                  )}
                  <Text variant="small" className="mt-3">
                    {visit.reminder}
                  </Text>
                  {visit.status === "Awaiting documentation" && (
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() =>
                        open("visit", { id: visit.id, title: visit.type })
                      }
                    >
                      <ClipboardList className="size-4" />
                      Record visit outcome
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </Panel>
      </TabsContent>
      <TabsContent value="profile" className="space-y-5">
        <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_1fr]">
          <Panel
            title="Demographics & access"
            description="Patient information · read-only"
          >
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Detail label="Full name" value={patient.name} />
              <Detail label="Date of birth" value={patient.dob} />
              <Detail label="Medicare ID" value={record.profile.medicareId} />
              <Detail label="Internal patient ID" value={patient.displayId} />
              <Detail label="Phone" value={record.profile.phone} />
              <Detail label="Email" value={record.profile.email} />
              <Detail label="Address" value={record.profile.address} />
              <Detail
                label="Preferred language"
                value={record.profile.language}
              />
              <Detail
                label="Preferred modality"
                value={record.profile.modality}
              />
              <Detail
                label="Digital literacy"
                value={record.profile.digitalLiteracy}
              />
              <Detail
                label="Transportation barrier"
                value={record.profile.transportation}
              />
              <Detail
                label="Primary care provider"
                value={record.profile.pcp}
              />
            </dl>
          </Panel>
          <Panel
            title="Caregivers & family"
            description="Linked people and their granted access · informational only"
          >
            {!record.caregivers.length ? (
              <Empty>No linked caregivers or family members recorded.</Empty>
            ) : (
              record.caregivers.map((person) => (
                <article key={person.name} className="rounded-lg border p-4">
                  <Text className="font-medium">{person.name}</Text>
                  <Text variant="small" className="mt-1">
                    {person.relationship}
                  </Text>
                  <Text className="mt-3">{person.permissions}</Text>
                </article>
              ))
            )}
          </Panel>
        </div>
        <Panel
          title="Enrollment history"
          description={`Assigned hub: ${record.profile.hub}`}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {record.enrollments.map((enrollment) => (
              <article key={enrollment.track} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <Heading level={4} as="h3">
                    {enrollment.track}
                  </Heading>
                  <Badge variant="outline">{enrollment.status}</Badge>
                </div>
                <dl className="grid gap-4">
                  <Detail label="Track start date" value={enrollment.start} />
                  <Detail
                    label="Baseline at enrollment"
                    value={enrollment.baseline}
                  />
                  <Detail
                    label="Assigned care team"
                    value={
                      preview.team
                        .map((member) => `${member.name} (${member.role})`)
                        .join(" · ") || "Not assigned"
                    }
                  />
                </dl>
              </article>
            ))}
          </div>
        </Panel>
        <Panel
          title="Social needs"
          description="Record assessed needs and supporting context. Demographic access flags above remain read-only."
          action={
            <Button onClick={() => open("referral")}>
              Create social referral
              <ArrowUpRight className="size-4" />
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {preview.needs.map((need) => (
              <article key={need.category} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <Heading level={4} as="h3">
                    {need.category}
                  </Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit ${need.category.toLowerCase()} need`}
                    onClick={() =>
                      open("need", {
                        title: need.category,
                        category: need.status,
                        text: need.notes,
                      })
                    }
                  >
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                </div>
                <Badge variant="outline" className="mt-2">
                  {need.status === "Yes"
                    ? "Need identified"
                    : need.status === "No"
                      ? "No need reported"
                      : need.status}
                </Badge>
                {need.notes && (
                  <Text className="mt-3 whitespace-pre-wrap break-words">
                    {need.notes}
                  </Text>
                )}
                <Text variant="small" className="mt-3">
                  Captured: {need.captured} · {need.author}
                </Text>
              </article>
            ))}
          </div>
          <div className="mt-6 border-t pt-5">
            <Heading level={4} as="h3" className="mb-3">
              Social referrals
            </Heading>
            {!preview.referrals.length ? (
              <Empty>No social referrals recorded.</Empty>
            ) : (
              preview.referrals.map((referral) => (
                <div key={referral.id} className="mb-3 rounded-lg border p-4">
                  <Text className="font-medium">
                    {referral.category} · {referral.status}
                  </Text>
                  <Text className="mt-1 break-words">{referral.reason}</Text>
                  <Text variant="small" className="mt-2">
                    Reference ID: {referral.id}
                  </Text>
                </div>
              ))
            )}
          </div>
        </Panel>
      </TabsContent>
      <TabsContent value="communications" className="space-y-5">
        <Panel
          title="Recommendations"
          description="Review triggering signals before approving, modifying or dismissing a recommendation."
        >
          {!record.recommendations.length ? (
            <Empty>No pending recommendations for this patient.</Empty>
          ) : (
            <div className="space-y-4">
              {record.recommendations.map((recommendation) => (
                <article
                  key={recommendation.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Heading level={4} as="h3">
                      {recommendation.title}
                    </Heading>
                    <Text className="mt-2">{recommendation.explanation}</Text>
                    <Text variant="small" className="mt-2">
                      {recommendation.signalDate}
                    </Text>
                  </div>
                  <Button asChild variant="outline">
                    <a
                      href={`${appBase}/patients/${patient.id}/from/${returnView}/recommendations/${recommendation.id}`}
                    >
                      Review recommendation
                      <ArrowUpRight className="size-4" />
                    </a>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </Panel>
        <Panel
          title="Patient messages"
          description={`Secure communication log · ${patient.name}`}
        >
          {!preview.messages.length ? (
            <Empty>
              No messages recorded. You can start a conversation with this
              patient.
            </Empty>
          ) : (
            <ol className="space-y-4">
              {preview.messages.map((item) => (
                <li
                  key={item.id}
                  className={`max-w-2xl rounded-xl border p-4 ${item.direction === "outgoing" ? "ml-auto bg-accent/50" : "bg-muted/30"}`}
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <Text className="font-medium">{item.author}</Text>
                    <Text variant="small">
                      {item.direction === "incoming" ? "Received" : "Outgoing"}{" "}
                      · {item.date}
                    </Text>
                  </div>
                  <Text className="mt-3 whitespace-pre-wrap break-words">
                    {item.text}
                  </Text>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 space-y-3 border-t pt-5">
            <Label htmlFor="patient-reply">Message to {patient.name}</Label>
            <Textarea
              id="patient-reply"
              value={message}
              maxLength={4000}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write a message…"
              className="min-h-28"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Text variant="small">Text only · {message.length}/4,000</Text>
              <Button
                disabled={!message.trim()}
                onClick={() => open("message", { text: message })}
              >
                <Mail className="size-4" />
                Preview message
              </Button>
            </div>
          </div>
        </Panel>
      </TabsContent>
      <Dialog
        open={draft !== null}
        onOpenChange={(value) => {
          if (!value) setDraft(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {draft ? actionNames[draft.action] : "Patient action"}
            </DialogTitle>
            <DialogDescription>
              {patient.name} · {patient.displayId} · Preview only. Changes are
              not saved and nothing is sent.
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                apply();
              }}
            >
              {referralResult === "success" ? (
                <div
                  role="status"
                  className="space-y-3 rounded-lg border border-success/20 bg-success-soft p-4"
                >
                  <CheckCircle2 className="size-6 text-success" />
                  <Heading level={4} as="h3">
                    Referral submission preview
                  </Heading>
                  <Text>
                    Success state shown. No referral was submitted to Unite Us.
                  </Text>
                  <Text variant="small">
                    Example reference ID: {preview.referrals.at(-1)?.id}
                  </Text>
                </div>
              ) : (
                <>
                  {draft.action === "remove" ? (
                    <Text>
                      Remove “{draft.title}” from this care plan preview?
                    </Text>
                  ) : null}
                  {["goal", "activity", "team"].includes(draft.action) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-title">
                        {draft.action === "team" ? "Full name" : "Title"} *
                      </Label>
                      <Input
                        id="action-title"
                        required
                        maxLength={180}
                        value={draft.title}
                        onChange={(event) =>
                          update({ title: event.target.value })
                        }
                      />
                    </div>
                  )}
                  {["team", "need", "order", "referral"].includes(
                    draft.action,
                  ) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-category">
                        {draft.action === "team"
                          ? "Role"
                          : draft.action === "need"
                            ? `${draft.title} need`
                            : "Category"}{" "}
                        *
                      </Label>
                      <Select
                        value={draft.category}
                        onValueChange={(category) => update({ category })}
                      >
                        <SelectTrigger id="action-category" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(draft.action === "team"
                            ? [
                                "Physician",
                                "Nurse",
                                "Care coordinator",
                                "RN care coach",
                                "Ancillary care provider",
                              ]
                            : draft.action === "need"
                              ? ["Yes", "No", "Not assessed"]
                              : draft.action === "order"
                                ? ["Laboratory", "Device"]
                                : ["Transportation", "Food", "Housing", "Other"]
                          ).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {["goal", "activity"].includes(draft.action) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-owner">
                        Responsible team member *
                      </Label>
                      <Input
                        id="action-owner"
                        required
                        maxLength={180}
                        value={draft.extra}
                        onChange={(event) =>
                          update({ extra: event.target.value })
                        }
                      />
                    </div>
                  )}
                  {!["team", "activity", "hie", "remove"].includes(
                    draft.action,
                  ) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-details">
                        {draft.action === "goal"
                          ? "Target value and goal description"
                          : draft.action === "need"
                            ? "Supporting notes (optional)"
                            : draft.action === "referral"
                              ? "Referral reason"
                              : draft.action === "message"
                                ? "Message"
                                : draft.action === "visit"
                                  ? "Visit outcome summary"
                                  : draft.action === "order"
                                    ? "Order details"
                                    : "Clinical note / decision"}
                        {draft.action !== "need" && " *"}
                      </Label>
                      <Textarea
                        id="action-details"
                        className="min-h-28"
                        required={draft.action !== "need"}
                        maxLength={4000}
                        value={draft.text}
                        onChange={(event) =>
                          update({ text: event.target.value })
                        }
                      />
                    </div>
                  )}
                  {draft.action === "note" && (
                    <Text variant="small">
                      Notes are associated with this patient and care plan and
                      become read-only after saving.
                    </Text>
                  )}
                  {draft.action === "hie" && (
                    <div className="space-y-4">
                      <dl>
                        <Detail label="Recipient" value={record.profile.pcp} />
                      </dl>
                      <Text>
                        The update includes this patient’s current care goals,
                        activities and responsible care team. Outbound
                        communication only.
                      </Text>
                      <div className="rounded-lg border p-4">
                        <Text className="font-medium">Update summary</Text>
                        {preview.goals.map((goal) => (
                          <Text key={goal.id} className="mt-2">
                            {goal.title}: {goal.target}
                          </Text>
                        ))}
                        {preview.activities.map((activity) => (
                          <Text key={activity.id} className="mt-2">
                            {activity.title} · {activity.owner}
                          </Text>
                        ))}
                        {preview.team.map((member) => (
                          <Text key={member.id} className="mt-2">
                            {member.name} · {member.role}
                          </Text>
                        ))}
                        <Text variant="small" className="mt-3">
                          {preview.activities.length} activities ·{" "}
                          {preview.team.length} care team members
                        </Text>
                      </div>
                    </div>
                  )}
                  {draft.action === "referral" && (
                    <div className="space-y-4">
                      <fieldset className="space-y-3 rounded-lg border p-4">
                        <legend className="px-1 text-sm font-medium">
                          Confirm contact data to share with Unite Us *
                        </legend>
                        {(["phone", "email", "address"] as const).map(
                          (contact) => (
                            <div
                              key={contact}
                              className="flex items-start gap-3"
                            >
                              <Checkbox
                                id={`share-${contact}`}
                                disabled={
                                  record.profile[contact] === "Not recorded"
                                }
                                checked={draft.contacts.includes(contact)}
                                onCheckedChange={(checked) =>
                                  update({
                                    contacts: checked
                                      ? [...draft.contacts, contact]
                                      : draft.contacts.filter(
                                          (value) => value !== contact,
                                        ),
                                  })
                                }
                              />
                              <Label
                                htmlFor={`share-${contact}`}
                                className="block min-w-0 break-words leading-5"
                              >
                                {contact}: {record.profile[contact]}
                              </Label>
                            </div>
                          ),
                        )}
                      </fieldset>
                      {[
                        record.profile.phone,
                        record.profile.email,
                        record.profile.address,
                      ].every((value) => value === "Not recorded") && (
                        <Text className="text-destructive">
                          Contact data is missing. A referral cannot be
                          submitted until contact information is recorded.
                        </Text>
                      )}
                    </div>
                  )}
                  {referralResult === "failure" && (
                    <div
                      role="alert"
                      className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                    >
                      <Text className="font-medium text-destructive">
                        Referral could not be submitted
                      </Text>
                      <Text className="mt-1">
                        Your entered details are retained. Retry the submission
                        preview or cancel to return to the profile.
                      </Text>
                    </div>
                  )}
                  {error && (
                    <Text role="alert" className="text-destructive">
                      {error}
                    </Text>
                  )}
                </>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraft(null)}
                >
                  {referralResult === "success" ? "Close" : "Cancel"}
                </Button>
                {referralResult !== "success" && (
                  <Button
                    type="submit"
                    variant={
                      draft.action === "remove" ? "destructive" : "default"
                    }
                  >
                    {draft.action === "remove"
                      ? "Remove in preview"
                      : draft.action === "hie"
                        ? "Preview PCP update"
                        : draft.action === "referral"
                          ? referralResult === "failure"
                            ? "Retry preview"
                            : "Preview submission"
                          : "Apply to preview"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
