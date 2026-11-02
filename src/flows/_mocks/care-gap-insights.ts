/** Prepared summaries for the fictional Oct 19, 2026 snapshot. */
export const careGapInsights = [
  {
    id: "bp-overdue",
    track: "ckm",
    title: "Blood pressure monitoring gaps",
    summary: "18 of 36 CKM patients have no blood pressure readings for more than 7 days.",
    action: "Review the affected patients and consider outreach to resume monitoring.",
    view: "gap",
  },
  {
    id: "phq-overdue",
    track: "bh",
    title: "PHQ-9 monitoring gap",
    summary: "9 of 27 BH patients have no PHQ-9 measurement for more than 7 days.",
    action: "Review the patient’s measurement history and consider a follow-up assessment.",
    view: "all-bh-overdue-risk",
  },
  {
    id: "eckm-missing",
    track: "eckm",
    title: "No measurements recorded",
    summary: "9 of 9 eCKM patients have no measurements recorded.",
    action: "Review monitoring setup and consider contacting the patient about the first measurement.",
    view: "all-eckm-never-risk",
  },
  {
    id: "eckm-baseline",
    track: "eckm",
    title: "Baseline data missing",
    summary: "9 of 9 eCKM patients have no baseline measurement recorded.",
    action: "Review the patient record and arrange collection of the missing baseline measurement.",
    view: "all-eckm-never-risk",
  },
];
