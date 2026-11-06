export const mockClinician = {
  name: "Dr. Sarah Lewis",
  initials: "SL",
  role: "Clinician",
};
export type ClinicianProfile = typeof mockClinician;

export type CareTeamUser = {
  id: string;
  name: string;
  email: string;
  defaultCareRole: string;
};

export const mockCareTeamUsers: CareTeamUser[] = [
  { id: "user-sarah-lewis", name: "Sarah Lewis, MD", email: "sarah.lewis@example.test", defaultCareRole: "Physician" },
  { id: "user-james-patel", name: "James Patel, MD", email: "james.patel@example.test", defaultCareRole: "Physician" },
  { id: "user-maya-torres", name: "Maya Torres, RN", email: "maya.torres@example.test", defaultCareRole: "Care coordinator" },
  { id: "user-jordan-kim", name: "Jordan Kim, RN", email: "jordan.kim@example.test", defaultCareRole: "Care coordinator" },
  { id: "user-elena-brooks", name: "Elena Brooks, PT", email: "elena.brooks@example.test", defaultCareRole: "Ancillary care provider" },
];
