import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Heading, Text } from "@/shared/ui/typography";
import type { CarePlanSnapshot } from "@/flows/_mocks/patient-records";
import type { CarePlanChange } from "./care-plan-changes";

function FullCarePlan({ plan }: { plan: CarePlanSnapshot }) {
  return (
    <div className="space-y-5 rounded-lg border p-4">
      <section className="space-y-3">
        <Heading level={4} as="h3">Care goals</Heading>
        {!plan.goals.length && <Text variant="muted">No care goals recorded.</Text>}
        {plan.goals.map((goal) => (
          <div key={goal.id}>
            <Text className="font-medium break-words">{goal.title}</Text>
            <Text className="mt-1 break-words">Target: {goal.target}</Text>
            <Text variant="small" className="mt-1 break-words">Responsible: {goal.owner}</Text>
          </div>
        ))}
      </section>
      <section className="space-y-3 border-t pt-4">
        <Heading level={4} as="h3">Activities & interventions</Heading>
        {!plan.activities.length && <Text variant="muted">No activities recorded.</Text>}
        {plan.activities.map((activity) => (
          <div key={activity.id}>
            <Text className="break-words">{activity.title}</Text>
            <Text variant="small" className="mt-1 break-words">Responsible: {activity.owner}</Text>
          </div>
        ))}
      </section>
      <section className="space-y-3 border-t pt-4">
        <Heading level={4} as="h3">Care team</Heading>
        {!plan.team.length && <Text variant="muted">No care team assigned.</Text>}
        {plan.team.map((member) => (
          <div key={member.id}>
            <Text className="break-words">{member.name}</Text>
            <Text variant="small" className="mt-1 break-words">{member.role}</Text>
          </div>
        ))}
      </section>
    </div>
  );
}

export function CarePlanUpdatePreview({ plan, changes, lastSentAt }: {
  plan: CarePlanSnapshot;
  changes: CarePlanChange[];
  lastSentAt: string | null;
}) {
  return (
    <div className="space-y-4">
      {lastSentAt ? (
        <>
          <div>
            <Heading level={4} as="h3">Changes since last send · {changes.length}</Heading>
            <Text variant="small" className="mt-1">Last sent: {lastSentAt}</Text>
          </div>
          {!changes.length ? (
            <Text variant="muted" className="rounded-lg border p-4">No changes since the last send.</Text>
          ) : (
            <div className="divide-y rounded-lg border px-4">
              {changes.map((change) => (
                <section key={change.id} className="space-y-3 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{change.kind}</Badge>
                    <Text variant="small">{change.section}</Text>
                  </div>
                  <Text className="font-medium break-words">{change.title}</Text>
                  <dl className="space-y-3">
                    {change.fields.filter((field) =>
                      change.kind === "Updated" || !["Title", "Name"].includes(field.label),
                    ).map((field) => (
                      <div key={field.label}>
                        <dt className="text-xs text-muted-foreground">{field.label}</dt>
                        <dd className="mt-1 space-y-1 text-sm break-words">
                          {change.kind === "Updated" ? (
                            <>
                              <div><span className="text-muted-foreground">Before: </span>{field.before}</div>
                              <div><span className="font-medium">After: </span>{field.after}</div>
                            </>
                          ) : field.after ?? field.before}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          )}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="group w-full justify-between">
                View full care plan
                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3"><FullCarePlan plan={plan} /></CollapsibleContent>
          </Collapsible>
        </>
      ) : (
        <>
          <Heading level={4} as="h3">Full care plan · First send</Heading>
          <FullCarePlan plan={plan} />
        </>
      )}
    </div>
  );
}
