export const workspaceNavigation = [
  {
    id: "monitoring",
    label: "Monitoring",
    href: "/monitoring/all",
    description: "Active patients, alerts, and gaps in monitoring.",
  },
  {
    id: "patients",
    label: "Patients",
    href: "/patients",
    description: "The patient registry, enrollment, and patient records.",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    href: "/recommendations",
    description:
      "Recommendations across patients, with explanations and clinician review.",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/messages",
    description: "Patient conversations and replies from the care team.",
  },
  {
    id: "outcomes",
    label: "Outcomes",
    href: "/outcomes",
    description:
      "Clinical outcome attainment across care tracks and patient cohorts.",
  },
];
export type WorkspaceItem = (typeof workspaceNavigation)[number];

export const unavailableWorkspace: WorkspaceItem = {
  id: "unavailable",
  label: "Section unavailable",
  href: "/monitoring/all",
  description: "Choose one of the sections in the main navigation.",
};
