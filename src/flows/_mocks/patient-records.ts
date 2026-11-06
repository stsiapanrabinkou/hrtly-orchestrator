import { patients, recommendations, type Patient } from "./orchestrator";
import { measurementSnapshot } from "./measurement-readings";

/** Fictional, session-only design fixtures. No clinical rules or integrations run here.
 * WBS: Orchestrator (FULL) 24–31, 60–65, 68, 70–73, 108, 114, 167–168.
 */
export type TimelineEvent = {
  id: string;
  date: string;
  sortDate: string;
  type: string;
  title: string;
  detail: string;
  source: string;
};
export type CarePlanSnapshot = {
  goals: { id: string; title: string; target: string; owner: string }[];
  activities: { id: string; title: string; owner: string }[];
  team: { id: string; userId: string; name: string; role: string }[];
};
export type PatientRecord = {
  patientId: string;
  snapshot: string;
  snapshotTimestamp: number;
  carePlanUpdate: {
    lastSentAt: string | null;
    lastSentPlan: CarePlanSnapshot | null;
  };
  profile: {
    medicareId: string;
    phone: string;
    email: string;
    address: string;
    language: string;
    modality: string;
    digitalLiteracy: string;
    transportation: string;
    hub: string;
    pcp: string;
  };
  enrollments: {
    track: string;
    start: string;
    baseline: string;
    status: string;
    elapsed: string;
  }[];
  team: CarePlanSnapshot["team"];
  consents?: { hipaa: boolean; access: boolean; date: string; author: string };
  caregivers: { name: string; relationship: string; permissions: string }[];
  timeline: TimelineEvent[];
  escalations: {
    id: string;
    date: string;
    timestamp: number;
    severity: "red" | "yellow";
    status: "Open";
    title: string;
    action: string;
    note: string;
    author: string;
    noteDate: string | null;
    delivery: string;
  }[];
  goals: { id: string; title: string; target: string; owner: string }[];
  activities: { id: string; title: string; owner: string }[];
  notes: { id: string; text: string; author: string; date: string }[];
  orders: {
    id: string;
    type: string;
    detail: string;
    date: string;
    author: string;
    status: "Recorded" | "Cancelled";
    updatedBy?: string;
    updatedAt?: string;
    cancelledBy?: string;
    cancelledAt?: string;
  }[];
  visits: {
    id: string;
    date: string;
    type: string;
    status: string;
    summary: string;
    reminder: string;
    outcomeAuthor?: string;
    outcomeRecordedAt?: string;
    outcomeUpdatedBy?: string;
    outcomeUpdatedAt?: string;
  }[];
  needs: {
    category: string;
    status: string;
    notes: string;
    otherCategory?: string;
    captured: string;
    author: string;
  }[];
  referrals: {
    id: string; category: string; reason: string; status: string;
    author: string; date: string; sharedContacts: { label: string; value: string }[];
  }[];
  messages: {
    id: string;
    direction: "incoming" | "outgoing";
    timestamp: number;
    text: string;
    date: string;
    author: string;
  }[];
  recommendations: typeof recommendations;
};

const personalDetails = [
  {
    language: "English",
    modality: "Phone",
    digitalLiteracy: "Independent",
    transportation: "No barrier reported",
    hub: "Brooklyn Care Hub",
    clinician: "Sarah Lewis, MD",
  },
  {
    language: "English",
    modality: "Phone",
    digitalLiteracy: "Needs help using the monitor",
    transportation: "Yes · needs a ride to appointments",
    hub: "Brooklyn Care Hub",
    clinician: "Sarah Lewis, MD",
  },
  {
    language: "Spanish",
    modality: "Phone · Spanish interpreter",
    digitalLiteracy: "Independent",
    transportation: "No barrier reported",
    hub: "Queens Care Hub",
    clinician: "James Patel, MD",
  },
  {
    language: "English",
    modality: "Phone",
    digitalLiteracy: "Prefers phone support",
    transportation: "Not recorded",
    hub: "Queens Care Hub",
    clinician: "James Patel, MD",
  },
  {
    language: "English",
    modality: "Secure message",
    digitalLiteracy: "Independent",
    transportation: "No barrier reported",
    hub: "Brooklyn Care Hub",
    clinician: "Sarah Lewis, MD",
  },
  {
    language: "English",
    modality: "Phone",
    digitalLiteracy: "Needs device support",
    transportation: "Not recorded",
    hub: "Not assigned",
    clinician: "James Patel, MD",
  },
  {
    language: "English",
    modality: "Secure message",
    digitalLiteracy: "Independent",
    transportation: "No barrier reported",
    hub: "Queens Care Hub",
    clinician: "James Patel, MD",
  },
];

function createRecord(patient: Patient, index: number): PatientRecord {
  const known = index < 7;
  const personal = known
    ? personalDetails[index]
    : {
        language: "Not recorded",
        modality: "Not recorded",
        digitalLiteracy: "Not recorded",
        transportation: "Not recorded",
        hub: "Not assigned",
        clinician: "Not assigned",
      };
  const thomas = patient.displayId === "P-1002";
  const outcomes = [
    patient.outcome,
    ...(patient.additionalOutcomes ?? (patient.additionalOutcome ? [patient.additionalOutcome] : [])),
  ];
  const timeline: TimelineEvent[] = patient.metrics
    .filter(
      (metric) =>
        metric.value !== "Not applicable" && metric.value !== "No data",
    )
    .flatMap((metric, metricIndex) => {
      const labResult = ["HbA1c", "Creatinine", "Lipid panel"].includes(metric.label);
      return (metric.readings ?? []).map((reading, entryIndex) => ({
        id: `${metricIndex}-${entryIndex}`,
        date: reading.dateLabel,
        sortDate: new Date(reading.timestamp).toISOString(),
        type: labResult
          ? "Lab result"
          : metric.label === "Blood pressure"
            ? "Vital sign"
            : "Patient report",
        title: metric.label,
        detail: `${reading.value}${reading.secondary === undefined ? "" : `/${reading.secondary}`} ${metric.unit}`.trim(),
        source: labResult
          ? "Laboratory observation"
          : metric.label === "Blood pressure"
            ? "Home monitoring"
            : "Patient questionnaire",
      }));
    });
  if (thomas)
    timeline.push(
      {
        id: "creatinine-1002",
        date: "Sep 22, 2026",
        sortDate: "2026-09-22T00:00:00.000Z",
        type: "Lab result",
        title: "Creatinine",
        detail: "1.1 mg/dL",
        source: "Laboratory observation",
      },
      {
        id: "lipids-1002",
        date: "Sep 22, 2026",
        sortDate: "2026-09-22T00:00:00.000Z",
        type: "Lab result",
        title: "Lipid panel",
        detail: "Total cholesterol: 192 mg/dL\nLDL: 112 mg/dL\nHDL: 48 mg/dL\nTriglycerides: 160 mg/dL",
        source: "Laboratory observation",
      },
      {
        id: "visit-1002-open",
        date: "Oct 19, 2026 · 10:00 UTC",
        sortDate: "2026-10-19T10:00:00.000Z",
        type: "Visit",
        title: "Monitoring follow-up · awaiting documentation",
        detail: "Visit outcome has not been documented.",
        source: "Sarah Lewis, MD",
      },
      {
        id: "coaching-1002",
        date: "Oct 10, 2026 · 10:00 UTC",
        sortDate: "2026-10-10T10:00:00.000Z",
        type: "Coaching message",
        title: "Home monitoring reminder",
        detail:
          "Please take a blood pressure reading when you can. Contact your care team if you need help with the monitor.",
        source: "Automated coaching · recorded message",
      },
      {
        id: "visit-1002",
        date: "Sep 30, 2026 · 14:00 UTC",
        sortDate: "2026-09-30T14:00:00.000Z",
        type: "Visit",
        title: "Care plan review · completed",
        detail:
          "Reviewed home monitoring routine and confirmed preferred contact by phone.",
        source: "Sarah Lewis, MD",
      },
    );
  timeline.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
  const plan: CarePlanSnapshot = {
    goals: known
      ? outcomes.map((o) => ({
          id: `goal-${o.track}`,
          title: o.measure,
          target: o.target,
          owner: personal.clinician,
        }))
      : [],
    activities: known
      ? [
          {
            id: "monitoring",
            title: `Review ${patient.measurementType} measurements with the patient`,
            owner: personal.clinician,
          },
          {
            id: "follow-up",
            title:
              "Confirm the preferred contact method and support needs at follow-up",
            owner: index % 2 ? "Maya Torres, RN" : "Jordan Kim, RN",
          },
        ]
      : [],
    team: known
      ? [
          {
            id: "physician",
            userId: personal.clinician === "Sarah Lewis, MD" ? "user-sarah-lewis" : "user-james-patel",
            name: personal.clinician,
            role: "Physician",
          },
          {
            id: "coordinator",
            userId: index % 2 ? "user-maya-torres" : "user-jordan-kim",
            name: index % 2 ? "Maya Torres, RN" : "Jordan Kim, RN",
            role: "Care coordinator",
          },
        ]
      : [],
  };
  return {
    patientId: patient.id,
    snapshot: "Oct 19, 2026 · 12:00 UTC",
    snapshotTimestamp: measurementSnapshot,
    carePlanUpdate: {
      lastSentAt: known ? "Oct 16, 2026" : null,
      lastSentPlan: known
        ? {
            goals: plan.goals.map((goal, goalIndex) =>
              goalIndex === 0 ? { ...goal, owner: "Not assigned" } : goal,
            ),
            activities: plan.activities.filter((activity) => activity.id !== "follow-up"),
            team: plan.team.filter((member) => member.id !== "coordinator"),
          }
        : null,
    },
    profile: {
      medicareId: "Not recorded",
      phone: known
        ? `+1 (202) 555-${String(100 + index).padStart(4, "0")}`
        : "Not recorded",
      email: known
        ? `${patient.name.toLowerCase().replaceAll(" ", ".")}@example.test`
        : "Not recorded",
      address: known
        ? `${120 + index} West 24th Street, New York, NY 10001`
        : "Not recorded",
      pcp: known ? "Alex Chen, MD · Chelsea Primary Care" : "Not recorded",
      ...personal,
    },
    enrollments: outcomes.map((o) => ({
      track: o.track,
      start:
        o.window === "Window not established" ? "Not recorded" : "Apr 19, 2026",
      baseline: o.baseline,
      status: known && o.window !== "Window not established" ? "Active" : "Not recorded",
      elapsed:
        o.window === "Window not established"
          ? "Days elapsed unavailable"
          : "183 days elapsed",
    })),
    team: plan.team,
    caregivers: thomas
      ? [
          {
            name: "Anna Reed",
            relationship: "Daughter · caregiver",
            permissions:
              "View care plan and appointment reminders · no messaging access",
          },
        ]
      : [],
    timeline,
    escalations:
      patient.flag === "none"
        ? []
        : [
            {
              id: `alert-${patient.displayId}`,
              date: patient.alertDate,
              timestamp: Date.parse(patient.alertDate.replace(" · ", " ")),
              severity: patient.flag === "red" ? "red" : "yellow",
              status: "Open",
              title: patient.reason,
              action: patient.overdue
                ? "Contact the patient to understand the monitoring gap and agree on the next measurement."
                : "Review the existing alert with the assigned clinical team.",
              note: known
                ? thomas
                  ? "Phone outreach requested. Check whether Thomas needs help with the monitor before agreeing on the next reading."
                  : "Assigned care team to review the recorded signals and determine follow-up."
                : "",
              author: known ? personal.clinician : "Not recorded",
              noteDate: known ? patient.alertDate : null,
              delivery: known
                ? "Notifications sent to patient and care team."
                : "Notification details not recorded.",
            },
          ],
    goals: plan.goals,
    activities: plan.activities,
    notes: thomas
      ? [
          {
            id: "note-1002",
            text: "Reviewed home monitoring routine and confirmed preferred contact by phone.",
            author: "Sarah Lewis, MD",
            date: "Sep 30, 2026 · 14:00 UTC",
          },
        ]
      : [],
    orders: thomas
      ? [
          {
            id: "order-1002",
            author: "Sarah Lewis, MD",
            status: "Recorded",
            type: "Laboratory",
            detail: "HbA1c · routine monitoring",
            date: "Sep 15, 2026",
          },
        ]
      : [],
    visits: thomas
      ? [
          {
            id: "visit-1002",
            date: "Sep 30, 2026 · 14:00 UTC",
            type: "Care plan review",
            status: "Completed",
            outcomeAuthor: "Sarah Lewis, MD",
            outcomeRecordedAt: "Sep 30, 2026 · 14:00 UTC",
            summary:
              "Reviewed home monitoring routine and confirmed preferred contact by phone.",
            reminder: "24-hour email reminder recorded",
          },
          {
            id: "visit-1002-open",
            date: "Oct 19, 2026 · 10:00 UTC",
            type: "Monitoring follow-up",
            status: "Outcome not recorded",
            summary: "",
            reminder:
              "24-hour email reminder delivered · Oct 18, 2026 · 10:00 UTC",
          },
        ]
      : [],
    needs: ["Transportation", "Food", "Housing", "Other"].map((category) => ({
      category,
      status:
        known && category === "Transportation" && personal.transportation.startsWith("Yes")
          ? "Yes"
          : known && category !== "Other"
            ? "No"
            : "Not assessed",
      notes:
        thomas && category === "Transportation"
          ? "Needs a ride to in-person appointments."
          : "",
      captured: known ? "Sep 30, 2026" : "Not recorded",
      author: known ? personal.clinician : "Not recorded",
    })),
    referrals: [],
    messages: thomas
      ? [
          {
            id: "message-1002-in",
            timestamp: Date.parse("2026-10-18T16:20:00Z"),
            direction: "incoming",
            text: "I am having trouble getting my monitor to connect. Could someone call me?",
            date: "Oct 18, 2026 · 16:20 UTC",
            author: patient.name,
          },
          {
            id: "message-1002-out",
            timestamp: Date.parse("2026-10-19T09:00:00Z"),
            direction: "outgoing",
            text: "Thank you for letting us know. We have asked your care coordinator to call and help with the monitor.",
            date: "Oct 19, 2026 · 09:00 UTC",
            author: "Maya Torres, RN",
          },
        ]
      : known ? [{ id: `message-${patient.displayId}`, direction: "incoming", timestamp: Date.parse("2026-10-18T15:00:00Z"), text: "I have a question about my care plan. Could someone from the team contact me?", date: "Oct 18, 2026 · 15:00 UTC", author: patient.name }] : [],
    recommendations: recommendations.filter((r) => r.patientId === patient.id),
  };
}

export const patientRecords: PatientRecord[] = patients.map(createRecord);
