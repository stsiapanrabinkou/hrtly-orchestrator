import { ArrowUpRight, Eraser, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading, Text } from "@/shared/ui/typography";
import type { PatientRecord } from "@/flows/_mocks/patient-records";
import type { Patient } from "@/flows/_mocks/orchestrator";
import { Detail, Empty, Panel } from "./RecordPanels";

type Need = PatientRecord["needs"][number];
type Referral = PatientRecord["referrals"][number];
type Props = {
  patient: Patient;
  record: PatientRecord;
  onCarePlanOpen: () => void;
  onNeedEdit: (need: Need) => void;
  onNeedClear: (need: Need) => void;
  onReferralCreate: (need?: Need) => void;
  onReferralView: (referral: Referral) => void;
};

const needLabels: Record<string, string> = {
  Transportation: "Transportation", Food: "Food insecurity", Housing: "Housing instability", Other: "Other social needs",
};

export function PatientProfilePanels({ patient, record, onCarePlanOpen, onNeedEdit, onNeedClear, onReferralCreate, onReferralView }: Props) {
  const { profile } = record;
  const transportation = record.needs.find((need) => need.category === "Transportation");
  const transportationFlag = transportation
    ? transportation.status === "Yes" ? "Barrier reported" : transportation.status === "No" ? "No barrier reported" : "Not assessed"
    : profile.transportation;
  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="contents min-w-0 gap-5 xl:flex xl:flex-col">
        <div className="order-1 w-full min-w-0">
          <Panel title="Personal details">
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail label="Full name" value={patient.name} />
              <Detail label="Date of birth" value={patient.dob} />
              <Detail label="Medicare ID" value={profile.medicareId} />
              <Detail label="Patient ID" value={patient.displayId} />
            </dl>
            <div className="mt-6 border-t pt-5">
              <Heading level={4} as="h3">Contact information</Heading>
              <dl className="mt-4 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <Detail label="Phone" value={profile.phone} />
                <Detail label="Email" value={profile.email} />
                <div className="sm:col-span-2"><Detail label="Address" value={profile.address} /></div>
              </dl>
            </div>
          </Panel>
        </div>
        <div className="order-2 w-full min-w-0">
          <Panel title="Communication & access">
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail label="Preferred language" value={profile.language} />
              <Detail label="Preferred contact method" value={profile.modality} />
              <Detail label="Digital literacy" value={profile.digitalLiteracy} />
              <Detail label="Transportation" value={transportationFlag} />
            </dl>
          </Panel>
        </div>
        <div className="order-4 w-full min-w-0">
          <Panel title="Social needs" action={
            <Button variant="outline" onClick={() => onReferralCreate()}><Plus className="size-4" />Create social referral</Button>
          }>
            {!record.needs.length ? <Empty>No social needs assessed.</Empty> : (
              <div className="divide-y">
                {record.needs.map((need) => (
                  <article key={need.category} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Heading level={4} as="h3">{needLabels[need.category] ?? need.category}</Heading>
                          <Badge variant="outline" className={need.status === "Yes" ? "bg-warning-soft text-warning" : ""}>
                            {need.status === "Yes" ? "Need identified" : need.status === "No" ? "No need reported" : "Not assessed"}
                          </Badge>
                        </div>
                        {need.otherCategory && <Text variant="small" className="mt-2">Category: {need.otherCategory}</Text>}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${need.category.toLowerCase()} need`} onClick={() => onNeedEdit(need)}><Pencil className="size-4" /></Button>
                        {need.status !== "Not assessed" && <Button variant="ghost" size="icon" aria-label={`Clear ${need.category.toLowerCase()} assessment`} onClick={() => onNeedClear(need)}><Eraser className="size-4" /></Button>}
                      </div>
                    </div>
                    {need.notes && <Text className="mt-3 whitespace-pre-wrap break-words">{need.notes}</Text>}
                    {need.captured !== "Not recorded" && <Text variant="small" className="mt-3">{need.author} · {need.captured}</Text>}
                    {need.status === "Yes" && <Button variant="ghost" size="sm" className="mt-3" onClick={() => onReferralCreate(need)}>Create referral<ArrowUpRight className="size-4" /></Button>}
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
        <div className="order-5 w-full min-w-0">
          <Panel title="Social referrals">
            {!record.referrals.length ? <Empty>No social referrals recorded.</Empty> : (
              <div className="divide-y">
                {record.referrals.map((referral) => (
                  <article key={referral.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2"><Heading level={4} as="h3">{referral.category}</Heading><Badge variant="outline">{referral.status}</Badge></div>
                      <Button variant="outline" size="sm" onClick={() => onReferralView(referral)}>View referral</Button>
                    </div>
                    <Text className="mt-3 whitespace-pre-wrap break-words">{referral.reason}</Text>
                    <Text variant="small" className="mt-3">{referral.author} · {referral.date}</Text>
                    <Text variant="small" className="mt-1">Reference ID: {referral.id}</Text>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
      <aside aria-label="Enrollment and care contacts" className="contents min-w-0 gap-5 xl:flex xl:flex-col">
        <div className="order-3 w-full min-w-0">
          <Panel title="Enrollment history">
            {!record.enrollments.length ? <Empty>No enrollments recorded.</Empty> : (
              <div className="divide-y">
                {record.enrollments.map((enrollment) => (
                  <article key={enrollment.track} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2"><Heading level={4} as="h3">{enrollment.track}</Heading><Badge variant="outline">{enrollment.status}</Badge></div>
                    <dl className="mt-4 grid gap-4"><Detail label="Track start date" value={enrollment.start} /><Detail label="Baseline at enrollment" value={enrollment.baseline} /></dl>
                  </article>
                ))}
              </div>
            )}
            <dl className="mt-5 border-t pt-5"><Detail label="Assigned hub / location" value={profile.hub} /></dl>
            {record.consents && <div className="mt-5 space-y-3"><Heading level={4} as="h3">Consent</Heading><Text>HIPAA consent · {record.consents.hipaa ? "Recorded" : "Not recorded"}</Text><Text>ACCESS disclosures · {record.consents.access ? "Acknowledged" : "Not recorded"}</Text><Text variant="small">{record.consents.author} · {record.consents.date}</Text></div>}
          </Panel>
        </div>
        <div className="order-6 w-full min-w-0">
          <Panel title="Care contacts" action={<Button variant="outline" onClick={onCarePlanOpen}>Manage team<ArrowUpRight className="size-4" /></Button>}>
            <dl><Detail label="Primary care provider" value={profile.pcp} /></dl>
            <div className="mt-5 border-t pt-5">
              <Heading level={4} as="h3">Care team</Heading>
              {!record.team.length ? <Text variant="muted" className="mt-3">No care team assigned.</Text> : (
                <div className="mt-3 divide-y">{record.team.map((member) => <div key={member.id} className="py-3 first:pt-0 last:pb-0"><Text className="font-medium break-words">{member.name}</Text><Text variant="small" className="mt-1">{member.role}</Text></div>)}</div>
              )}
            </div>
          </Panel>
        </div>
        <div className="order-7 w-full min-w-0">
          <Panel title="Caregivers & family">
            {!record.caregivers.length ? <Empty>No linked caregivers or family members.</Empty> : (
              <div className="divide-y">{record.caregivers.map((person) => (
                <article key={person.name} className="py-5 first:pt-0 last:pb-0">
                  <Text className="font-medium break-words">{person.name}</Text><Text variant="small" className="mt-1">{person.relationship}</Text>
                  <Text variant="small" className="mt-4">Granted access</Text><Text className="mt-1 break-words">{person.permissions}</Text>
                </article>
              ))}</div>
            )}
          </Panel>
        </div>
      </aside>
    </div>
  );
}
