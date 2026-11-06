import { toast } from "sonner";
import { Panel, Empty, Detail } from "./RecordPanels";
import { PatientCommunicationsPanel } from "./PatientCommunicationsPanel";
import { PatientEscalationsPanel } from "./PatientEscalationsPanel";
import { PatientProfilePanels } from "./PatientProfilePanels";
import { SearchField } from "./SearchField";
import { CarePlanUpdatePreview } from "./CarePlanUpdatePreview";
import { carePlanChanges } from "./care-plan-changes";
import { useState } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import type { CarePlanSnapshot, PatientRecord } from "@/flows/_mocks/patient-records";
import type { Patient } from "@/flows/_mocks/orchestrator";
import { mockCareTeamUsers, type CareTeamUser } from "@/flows/_mocks/clinician";
import type { RecommendationDecisionPreview, RecommendationReturnTab } from "./recommendation-navigation";

type Action =
  | "goal"
  | "activity"
  | "team"
  | "note"
  | "order"
  | "cancel-order"
  | "visit"
  | "delete-visit-outcome"
  | "hie"
  | "need"
  | "clear-need"
  | "referral"
  | "referral-details"
  | "message"
  | "remove";
type Draft = {
  action: Action;
  id?: string;
  userId?: string;
  mode?: "edit";
  title: string;
  text: string;
  extra: string;
  category: string;
  contacts: string[];
  collection?: "goals" | "activities" | "team" | "orders";
};
export type PatientActionPreview = {
  patientId: string;
  action: Action;
  values: Omit<Draft, "action">;
  carePlan?: CarePlanSnapshot;
};
type Props = {
  patient: Patient;
  record: PatientRecord;
  onCarePlanOpen: () => void;
  recommendationDecisions?: RecommendationDecisionPreview[];
  onRecommendationOpen?: (id: string, tab: RecommendationReturnTab) => void;
  careUsers?: CareTeamUser[];
  actingUser: string;
  returnView: string;
  appBase: string;
  referralPreviewOutcome?: "success" | "failure";
  messagePreviewOutcome?: "success" | "failure";
  onRecordPreview: (update: (current: PatientRecord) => PatientRecord) => void;
  onActionPreview?: (action: PatientActionPreview) => void;
};


const actionNames: Record<Action, string> = {
  goal: "Care goal",
  activity: "Care activity",
  team: "Care team member",
  note: "Clinical note",
  order: "Record order",
  "cancel-order": "Cancel order",
  visit: "Record visit outcome",
  "delete-visit-outcome": "Delete visit outcome",
  hie: "Send update to PCP",
  need: "Social need",
  "clear-need": "Clear assessment",
  referral: "Create social referral",
  "referral-details": "Social referral",
  message: "Reply to patient",
  remove: "Remove from care plan",
};

export function PatientRecordPanels({
  patient,
  record,
  onCarePlanOpen,
  recommendationDecisions = [],
  onRecommendationOpen,
  careUsers = mockCareTeamUsers,
  actingUser,
  returnView,
  appBase,
  referralPreviewOutcome = "success",
  messagePreviewOutcome = "success",
  onRecordPreview: setPreview,
  onActionPreview,
}: Props) {
  const preview = record;
  const changes = carePlanChanges(record.carePlanUpdate.lastSentPlan, record);
  const [draft, setDraft] = useState<Draft | null>(null);
  const assignedGoals = draft?.collection === "team"
    ? preview.goals.filter((goal) => goal.owner === draft.title) : [];
  const assignedActivities = draft?.collection === "team"
    ? preview.activities.filter((activity) => activity.owner === draft.title) : [];
  const [timelineType, setTimelineType] = useState("All events");
  const [timelineQuery, setTimelineQuery] = useState("");
  const [error, setError] = useState("");
  const [nextPreviewId, setNextPreviewId] = useState(1);
  const [referralResult, setReferralResult] = useState<"failure" | null>(null);
  const referralDetails = preview.referrals.find((referral) => referral.id === draft?.id);
  const hasContactDetails = [record.profile.phone, record.profile.email, record.profile.address]
    .some((value) => value !== "Not recorded" && value.trim().length > 0);
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
  const stamp = "Just now";
  const timelineSearchTerm = timelineQuery.trim().toLocaleLowerCase();
  const events = preview.timeline.filter(
    (event) =>
      (timelineType === "All events" || event.type === timelineType) &&
      (timelineSearchTerm.length < 2 ||
        `${event.title} ${event.detail} ${event.source}`
          .toLocaleLowerCase()
          .includes(timelineSearchTerm)),
  );
  const apply = () => {
    if (!draft) return;
    const { action, ...values } = draft;
    const text = draft.text.trim();
    if (action === "referral" && !draft.contacts.length) {
      setError("Select at least one contact detail to share.");
      return;
    }
    if (action === "need" && draft.title === "Other" && draft.category === "Yes" && !draft.extra.trim()) {
      setError("Enter a category for this social need.");
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
        (action === "goal" && !text))
    ) {
      setError("Complete all required fields.");
      return;
    }
    const selectedUser = careUsers.find((user) => user.id === draft.userId);
    if (action === "team") {
      if (!selectedUser) {
        setError("Select a user from the directory.");
        return;
      }
      if (preview.team.some((member) => member.userId === selectedUser.id && member.id !== draft.id)) {
        setError("This user is already on the care team.");
        return;
      }
    }
    onActionPreview?.({
      patientId: patient.id,
      action,
      values,
      ...(action === "hie" ? { carePlan: {
        goals: preview.goals, activities: preview.activities, team: preview.team,
      } } : {}),
    });
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
        owner: draft.extra.trim() || "Not assigned",
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
        owner: draft.extra.trim() || "Not assigned",
      };
      setPreview((current) => ({
        ...current,
        activities: draft.id
          ? current.activities.map((item) => (item.id === id ? activity : item))
          : [...current.activities, activity],
      }));
    }
    if (action === "team" && selectedUser) {
      const member = { id, userId: selectedUser.id, name: selectedUser.name, role: draft.category };
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
        ...(collection === "team" ? {
          goals: current.goals.map((goal) => goal.owner === draft.title
            ? { ...goal, owner: draft.extra || "Not assigned" } : goal),
          activities: current.activities.map((activity) => activity.owner === draft.title
            ? { ...activity, owner: draft.extra || "Not assigned" } : activity),
        } : {}),
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
        orders: draft.id
          ? current.orders.map((order) => order.id === draft.id
            ? { ...order, type: draft.category, detail: text, updatedBy: author, updatedAt: stamp }
            : order)
          : [
              { id, type: draft.category, detail: text, date: stamp, author, status: "Recorded" },
              ...current.orders,
            ],
      }));
    if (action === "cancel-order")
      setPreview((current) => ({
        ...current,
        orders: current.orders.map((order) => order.id === draft.id
          ? { ...order, status: "Cancelled", cancelledBy: author, cancelledAt: stamp }
          : order),
      }));
    if (action === "visit")
      setPreview((current) => ({
        ...current,
        timeline: current.timeline.map((event) =>
          event.id === draft.id
            ? {
                ...event,
                title: `${draft.title} · completed`,
                detail: text,
                source: author,
              }
            : event,
        ),
        visits: current.visits.map((visit) =>
          visit.id === draft.id
            ? {
                ...visit, status: "Completed", summary: text,
                outcomeAuthor: visit.outcomeAuthor ?? author,
                outcomeRecordedAt: visit.outcomeRecordedAt ?? stamp,
                ...(draft.mode === "edit" ? { outcomeUpdatedBy: author, outcomeUpdatedAt: stamp } : {}),
              }
            : visit,
        ),
      }));
    if (action === "delete-visit-outcome")
      setPreview((current) => ({
        ...current,
        visits: current.visits.map((visit) => visit.id === draft.id
          ? {
              ...visit, summary: "", outcomeAuthor: undefined, outcomeRecordedAt: undefined,
              outcomeUpdatedBy: undefined, outcomeUpdatedAt: undefined,
            }
          : visit),
        timeline: current.timeline.map((event) => event.id === draft.id
          ? { ...event, detail: "Visit completed. Outcome summary not recorded.", source: author }
          : event),
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
                otherCategory: draft.title === "Other" ? draft.extra.trim() : undefined,
                captured: stamp,
                author,
              }
            : need,
        ),
      }));
    if (action === "clear-need")
      setPreview((current) => ({
        ...current,
        needs: current.needs.map((need) => need.category === draft.title
          ? { ...need, status: "Not assessed", notes: "", otherCategory: undefined, captured: stamp, author }
          : need),
      }));
    if (action === "referral") {
      setPreview((current) => ({
        ...current,
        referrals: [
          ...current.referrals,
          {
            id: `REF-${patient.displayId}-${current.referrals.length + 1}`,
            category: draft.category,
            reason: text,
            status: "Submitted",
            author,
            date: stamp,
            sharedContacts: draft.contacts.map((contact) => ({
              label: contact === "phone" ? "Phone" : contact === "email" ? "Email" : "Address",
              value: record.profile[contact as "phone" | "email" | "address"],
            })),
          },
        ],
      }));
      toast.success("Referral submitted.", {
        description: `Reference ID: REF-${patient.displayId}-${preview.referrals.length + 1}`,
      });
      setDraft(null);
      return;
    }
    if (action === "hie") {
      setPreview((current) => ({
        ...current,
        carePlanUpdate: {
          lastSentAt: stamp,
          lastSentPlan: { goals: current.goals, activities: current.activities, team: current.team },
        },
      }));
    }
    toast.success(
      action === "hie"
        ? "Update sent to PCP."
        : {
            goal: "Care goal saved.",
            activity: "Care activity saved.",
            team: "Care team updated.",
            note: "Clinical note added.",
            order: draft.id ? "Order updated." : "Order recorded.",
            "cancel-order": "Order cancelled.",
            visit: draft.mode === "edit" ? "Visit outcome updated." : "Visit outcome recorded.",
            "delete-visit-outcome": "Visit outcome deleted.",
            need: "Social need updated.",
            "clear-need": "Assessment cleared.",
            "referral-details": "",
            message: "Message sent.",
            remove: draft.collection === "team" ? "Care team member removed." : draft.collection === "orders" ? "Order deleted." : "Item removed from care plan.",
            referral: "Referral submitted.",
          }[action],
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
        onClick={() => open("remove", { id, title, collection, extra: "Not assigned" })}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
  return (
    <>
      <TabsContent value="timeline" className="space-y-5">
        <Panel title="Clinical timeline">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label htmlFor="timeline-search" className="sr-only">
                Search clinical timeline
              </Label>
              <SearchField
                id="timeline-search"
                placeholder="Search events, values or source…"
                value={timelineQuery}
                onValueChange={setTimelineQuery}
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
                  className="relative grid gap-3 pb-7 pl-6 before:absolute before:-bottom-[9px] before:left-0 before:top-[9px] before:w-0.5 before:bg-border last:pb-0 last:before:hidden sm:grid-cols-[170px_1fr] sm:items-baseline"
                >
                  <div className="absolute -left-1 top-1 z-10 size-2.5 rounded-full border-2 border-background bg-primary" />
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
        <PatientEscalationsPanel escalations={preview.escalations} />
      </TabsContent>
      <TabsContent value="care" className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4">
          <div>
            <Text className="font-medium">
              {record.profile.pcp === "Not recorded"
                ? "PCP not recorded"
                : `PCP: ${record.profile.pcp}`}
            </Text>
            <Text variant="small" className="mt-1">
              {preview.carePlanUpdate.lastSentAt
                ? `${changes.length} ${changes.length === 1 ? "change" : "changes"} since last send · Last sent: ${preview.carePlanUpdate.lastSentAt}`
                : "Not sent yet"}
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
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="contents min-w-0 gap-5 xl:flex xl:flex-col">
            <div className="order-1 min-w-0">
              <Panel
            title="Care goals"
            action={
              <Button
                variant="outline"
                onClick={() => open("goal", { extra: "Not assigned" })}
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
            </div>
            <div className="order-2 min-w-0">
              <Panel
            title="Activities & interventions"
            action={
              <Button
                variant="outline"
                onClick={() => open("activity", { extra: "Not assigned" })}
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
            <div className="order-4 min-w-0">
              <Panel
            title="Clinical notes & decisions"
            action={
              <Button variant="outline" onClick={() => open("note")}>
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
            </div>
            <div className="order-6 min-w-0">
              <Panel
          title="Visits"
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{visit.status}</Badge>
                      {visit.summary && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Outcome actions for ${visit.type}`}>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => open("visit", { id: visit.id, title: visit.type, text: visit.summary, mode: "edit" })}>
                              Edit outcome
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => open("delete-visit-outcome", { id: visit.id, title: visit.type })}>
                              Delete outcome
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  {visit.summary && (
                    <Text className="mt-3 whitespace-pre-wrap break-words">
                      {visit.summary}
                    </Text>
                  )}
                  {visit.outcomeAuthor && <Text variant="small" className="mt-2">{visit.outcomeAuthor} · {visit.outcomeRecordedAt}</Text>}
                  {visit.outcomeUpdatedAt && <Text variant="small" className="mt-1">Updated: {visit.outcomeUpdatedBy} · {visit.outcomeUpdatedAt}</Text>}
                  {!visit.summary && <Text variant="muted" className="mt-3">Outcome not recorded.</Text>}
                  <Text variant="small" className="mt-3">
                    {visit.reminder}
                  </Text>
                  {!visit.summary && (
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
            </div>
          </div>
          <aside aria-label="Care team and orders" className="contents min-w-0 gap-5 xl:flex xl:flex-col">
            <div className="order-3 min-w-0">
              <Panel
          title="Care team"
          action={
            <Button variant="outline" onClick={() => open("team")}>
              <Plus className="size-4" />
              Add member
            </Button>
          }
        >
          {!preview.team.length ? (
            <Empty>No care team assigned.</Empty>
          ) : (
            <div className="divide-y">
              {preview.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Text className="font-medium break-words">{member.name}</Text>
                    <Text variant="small" className="mt-1">
                      {member.role}
                    </Text>
                  </div>
                  {editControls("team", member.id, member.name, () =>
                    open("team", {
                      id: member.id,
                      userId: member.userId,
                      title: member.name,
                      category: member.role,
                    }),
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
            </div>
            <div className="order-5 min-w-0">
              <Panel
            title="Lab & device orders"
            action={
              <Button variant="outline" onClick={() => open("order")}>
                <Plus className="size-4" />
                Record order
              </Button>
            }
          >
            {!preview.orders.length ? (
              <Empty>No orders documented.</Empty>
            ) : (
              <div className="divide-y">
                {preview.orders.map((order) => (
                  <article key={order.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{order.type}</Badge>
                        {order.status === "Cancelled" && <Badge variant="secondary">Cancelled</Badge>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${order.detail}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => open("order", { id: order.id, category: order.type, text: order.detail })}>
                            Edit order
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={order.status === "Cancelled"} onSelect={() => open("cancel-order", { id: order.id, title: order.detail })}>
                            Cancel order
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => open("remove", { id: order.id, title: order.detail, collection: "orders" })}>
                            Delete order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Text className="mt-2 whitespace-pre-wrap break-words">
                      {order.detail}
                    </Text>
                    <Text variant="small" className="mt-2">
                      {order.author} · {order.date}
                    </Text>
                    {order.updatedAt && <Text variant="small" className="mt-1">Updated: {order.updatedBy} · {order.updatedAt}</Text>}
                    {order.cancelledAt && <Text variant="small" className="mt-1">Cancelled: {order.cancelledBy} · {order.cancelledAt}</Text>}
                  </article>
                ))}
              </div>
            )}
          </Panel>
            </div>
          </aside>
        </div>
      </TabsContent>
      <TabsContent value="profile">
        <PatientProfilePanels
          patient={patient}
          record={preview}
          onCarePlanOpen={onCarePlanOpen}
          onNeedEdit={(need) => open("need", { title: need.category, category: need.status, text: need.notes, extra: need.otherCategory ?? "" })}
          onNeedClear={(need) => open("clear-need", { title: need.category })}
          onReferralCreate={(need) => open("referral", need ? { category: need.category, text: need.notes } : {})}
          onReferralView={(referral) => open("referral-details", { id: referral.id })}
        />
      </TabsContent>
      <TabsContent value="communications">
        <PatientCommunicationsPanel
          patient={patient}
          messages={preview.messages}
          recommendations={preview.recommendations}
          appBase={appBase}
          returnView={returnView}
          decisions={recommendationDecisions}
          onRecommendationOpen={onRecommendationOpen}
          onMessageSend={(text) => {
            onActionPreview?.({ patientId: patient.id, action: "message", values: { title: "", text, extra: "", category: "", contacts: [] } });
            if (messagePreviewOutcome === "failure") return false;
            const id = `preview-message-${nextPreviewId}`;
            setNextPreviewId((current) => current + 1);
            setPreview((current) => ({
              ...current,
              messages: [...current.messages, { id, direction: "outgoing", text, date: stamp, timestamp: Date.now(), author }],
            }));
            toast.success("Message sent.");
            return true;
          }}
        />
      </TabsContent>
      <Dialog
        open={draft !== null}
        onOpenChange={(value) => {
          if (!value) setDraft(null);
        }}
      >
        <DialogContent className="flex max-h-[85dvh] flex-col gap-6 overflow-hidden sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {draft?.action === "remove" && draft.collection === "team"
                ? "Remove care team member"
                : draft?.action === "remove" && draft.collection === "orders"
                  ? "Delete order"
                : draft?.action === "order" && draft.id
                  ? "Edit order"
                : draft?.action === "visit" && draft.mode === "edit"
                  ? "Edit visit outcome"
                : draft ? actionNames[draft.action] : "Patient action"}
            </DialogTitle>
            <DialogDescription>
              {patient.name} · {patient.displayId}
            </DialogDescription>
          </DialogHeader>
          {draft && (
            <form
              className="flex min-h-0 flex-col gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                apply();
              }}
            >
              <div className="-mx-1 grid min-h-0 gap-6 overflow-y-auto p-1">
                <>
                  {draft.action === "remove" ? (
                    <Text>
                      {draft.collection === "orders"
                        ? `Delete the order record “${draft.title}”?`
                        : `Remove “${draft.title}” from ${draft.collection === "team" ? "this care team" : "this care plan"}?`}
                    </Text>
                  ) : null}
                  {draft.action === "cancel-order" && <Text>Mark “{draft.title}” as cancelled? The order record will remain in the care plan.</Text>}
                  {draft.action === "delete-visit-outcome" && <Text>Delete the outcome summary for “{draft.title}”? The visit and its completion status will remain.</Text>}
                  {draft.action === "clear-need" && <Text>Clear the {draft.title.toLowerCase()} assessment and its notes? The need will be marked Not assessed.</Text>}
                  {draft.action === "referral-details" && referralDetails && (
                    <div className="space-y-5">
                      <dl className="grid gap-5 sm:grid-cols-2">
                        <Detail label="Category" value={referralDetails.category} />
                        <Detail label="Submission" value={referralDetails.status} />
                        <Detail label="Reference ID" value={referralDetails.id} />
                        <Detail label="Submitted by" value={`${referralDetails.author} · ${referralDetails.date}`} />
                      </dl>
                      <div><Text variant="small">Reason</Text><Text className="mt-2 whitespace-pre-wrap break-words">{referralDetails.reason}</Text></div>
                      <div className="border-t pt-4"><Heading level={4} as="h3">Contact details shared</Heading><dl className="mt-4 grid gap-4">{referralDetails.sharedContacts.map((contact) => <Detail key={contact.label} label={contact.label} value={contact.value} />)}</dl></div>
                    </div>
                  )}
                  {draft.action === "remove" && draft.collection === "team" &&
                    (assignedGoals.length > 0 || assignedActivities.length > 0) && (
                      <div className="space-y-4">
                        <div className="rounded-lg border border-warning/20 bg-warning-soft p-4">
                          <Text className="font-medium">This member has assigned responsibilities</Text>
                          <ul className="mt-3 space-y-2 text-sm">
                            {assignedGoals.map((goal) => <li key={goal.id}>Goal: {goal.title}</li>)}
                            {assignedActivities.map((activity) => <li key={activity.id}>Activity: {activity.title}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reassign-owner">Reassign responsibilities to</Label>
                          <Select value={draft.extra} onValueChange={(extra) => update({ extra })}>
                            <SelectTrigger id="reassign-owner" className="w-full"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not assigned">Not assigned</SelectItem>
                              {preview.team.filter((member) => member.id !== draft.id).map((member) => (
                                <SelectItem key={member.id} value={member.name}>{member.name} · {member.role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Text variant="small">Choosing Not assigned keeps the goals and activities without an individual responsible.</Text>
                        </div>
                      </div>
                    )}
                  {draft.action === "team" && (
                    <div className="space-y-2">
                      <Label htmlFor="care-team-user">User *</Label>
                      {draft.id ? (
                        <Input id="care-team-user" readOnly value={draft.title} className="bg-muted/30" />
                      ) : (
                        <Select
                          value={draft.userId}
                          required
                          onValueChange={(userId) => {
                            const user = careUsers.find((item) => item.id === userId);
                            if (user) update({ userId, title: user.name, category: user.defaultCareRole });
                          }}
                        >
                          <SelectTrigger id="care-team-user" className="w-full">
                            <SelectValue placeholder="Select user" />
                          </SelectTrigger>
                          <SelectContent>
                            {careUsers.map((user) => {
                              const onTeam = preview.team.some((member) => member.userId === user.id);
                              return (
                                <SelectItem key={user.id} value={user.id} disabled={onTeam}>
                                  {user.name} · {onTeam ? "Already on team" : user.email}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                  {["goal", "activity"].includes(draft.action) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-title">
                        {draft.action === "goal" ? "Goal" : "Activity or intervention"} *
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
                          ? "Care team role"
                          : draft.action === "need"
                            ? "Need identified"
                            : draft.action === "order" ? "Order type" : "Category"}{" "}
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
                  {draft.action === "need" && draft.title === "Other" && (
                    <div className="space-y-2">
                      <Label htmlFor="social-need-category">Category{draft.category === "Yes" ? " *" : " (optional)"}</Label>
                      <Input id="social-need-category" maxLength={180} required={draft.category === "Yes"} value={draft.extra} onChange={(event) => update({ extra: event.target.value })} />
                    </div>
                  )}
                  {draft.action === "goal" && (
                    <div className="space-y-2">
                      <Label htmlFor="goal-target">Target *</Label>
                      <Input
                        id="goal-target"
                        required
                        maxLength={4000}
                        value={draft.text}
                        onChange={(event) => update({ text: event.target.value })}
                      />
                    </div>
                  )}
                  {["goal", "activity"].includes(draft.action) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-owner">
                        Responsible team member (optional)
                      </Label>
                      <Select
                        value={draft.extra || undefined}
                        onValueChange={(extra) => update({ extra })}
                      >
                        <SelectTrigger id="action-owner" className="w-full">
                          <SelectValue placeholder="Select a care team member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not assigned">Not assigned</SelectItem>
                          {draft.extra && draft.extra !== "Not assigned" &&
                            !preview.team.some((member) => member.name === draft.extra) && (
                              <SelectItem value={draft.extra} disabled>
                                {draft.extra} · No longer on care team
                              </SelectItem>
                            )}
                          {preview.team.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name} · {member.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!preview.team.length && (
                        <Text variant="small">Add members in the Care team block to assign responsibility.</Text>
                      )}
                    </div>
                  )}
                  {!["goal", "team", "activity", "hie", "remove", "cancel-order", "delete-visit-outcome", "clear-need", "referral-details"].includes(
                    draft.action,
                  ) && (
                    <div className="space-y-2">
                      <Label htmlFor="action-details">
                        {draft.action === "need"
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
                      Include assessment findings, care decisions, and follow-up
                      instructions.
                    </Text>
                  )}
                  {draft.action === "hie" && (
                    <div className="space-y-4">
                      <dl>
                        <Detail label="Recipient" value={record.profile.pcp} />
                      </dl>
                      <CarePlanUpdatePreview
                        plan={preview}
                        changes={changes}
                        lastSentAt={preview.carePlanUpdate.lastSentAt}
                      />
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
                                {contact === "phone" ? "Phone" : contact === "email" ? "Email" : "Address"}: {record.profile[contact]}
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
                        Your details have been kept. Try again or cancel to return
                        to the profile.
                      </Text>
                    </div>
                  )}
                  {error && (
                    <Text role="alert" className="text-destructive">
                      {error}
                    </Text>
                  )}
                </>
              </div>
              <DialogFooter className="shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDraft(null)}
                >
                  {draft.action === "referral-details" ? "Close" : "Cancel"}
                </Button>
                  {draft.action !== "referral-details" && (
                  <Button
                    type="submit"
                    disabled={draft.action === "referral" && !hasContactDetails}
                    variant={
                      ["remove", "cancel-order", "delete-visit-outcome", "clear-need"].includes(draft.action) ? "destructive" : "default"
                    }
                  >
                    {draft.action === "remove"
                      ? draft.collection === "orders" ? "Delete order" : "Remove"
                      : draft.action === "delete-visit-outcome"
                        ? "Delete outcome"
                      : draft.action === "clear-need"
                        ? "Clear assessment"
                      : draft.action === "cancel-order"
                        ? "Cancel order"
                      : draft.action === "hie"
                        ? "Send update"
                        : draft.action === "referral"
                          ? referralResult === "failure"
                            ? "Try again"
                            : "Submit referral"
                          : draft.action === "message"
                            ? "Send message"
                            : draft.action === "visit"
                              ? draft.mode === "edit" ? "Save changes" : "Complete visit"
                              : draft.action === "note"
                                ? "Add note"
                                : draft.action === "order"
                                  ? draft.id ? "Save changes" : "Record order"
                                  : "Save changes"}
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
