import type { CarePlanSnapshot } from "@/flows/_mocks/patient-records";

export type CarePlanChange = {
  id: string;
  section: string;
  title: string;
  kind: "Added" | "Updated" | "Removed";
  fields: { label: string; before?: string; after?: string }[];
};

// Compare presentation fixtures with the last sent snapshot, not click counts.
export function carePlanChanges(
  previous: CarePlanSnapshot | null,
  current: CarePlanSnapshot,
): CarePlanChange[] {
  if (!previous) return [];
  const sections = [
    { key: "goals", label: "Care goal", fields: ["title", "target", "owner"] },
    { key: "activities", label: "Activity", fields: ["title", "owner"] },
    { key: "team", label: "Care team member", fields: ["name", "role"] },
  ] as const;
  const labels: Record<string, string> = {
    title: "Title", target: "Target", owner: "Responsible", name: "Name", role: "Role",
  };
  return sections.flatMap(({ key, label, fields }) => {
    const before = previous[key] as { id: string; [key: string]: string }[];
    const after = current[key] as { id: string; [key: string]: string }[];
    const ids = [...new Set([...after, ...before].map((item) => item.id))];
    return ids.flatMap((id): CarePlanChange[] => {
      const oldItem = before.find((item) => item.id === id);
      const newItem = after.find((item) => item.id === id);
      const changedFields = fields.filter((field) => oldItem?.[field] !== newItem?.[field]);
      if (!changedFields.length) return [];
      const item = newItem ?? oldItem!;
      return [{
        id: `${key}-${id}`,
        section: label,
        title: item.title ?? item.name,
        kind: !oldItem ? "Added" : !newItem ? "Removed" : "Updated",
        fields: changedFields.map((field) => ({
          label: labels[field], before: oldItem?.[field], after: newItem?.[field],
        })),
      }];
    });
  });
}
