import { ArrowLeft, PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading, Text } from "@/shared/ui/typography";
import { Shell } from "./Shell";
import {
  workspaceNavigation,
  type WorkspaceItem,
} from "@/flows/_mocks/navigation";

type Props = { item?: WorkspaceItem; appBase?: string };
export function WorkspacePreview({
  item = workspaceNavigation[1],
  appBase = "",
}: Props) {
  const section =
    item.id === "patients" ||
    item.id === "recommendations" ||
    item.id === "messages" ||
    item.id === "outcomes"
      ? item.id
      : "monitoring";
  return (
    <Shell section={section} appBase={appBase}>
      <div className="mb-7">
        <Heading level={1}>{item.label}</Heading>
        <Text variant="muted" className="mt-2">
          {item.description}
        </Text>
      </div>
      <section className="clinical-panel mx-auto flex min-h-96 max-w-3xl flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
          <PanelsTopLeft className="size-6" />
        </span>
        <Heading level={3} as="h2">
          No records to display
        </Heading>
        <Text variant="muted" className="max-w-md leading-relaxed">
          There are no records in this section.
        </Text>
        <Button asChild className="mt-2 min-h-11">
          <a href={`${appBase}/monitoring/all`}>
            <ArrowLeft />
            Back to monitoring
          </a>
        </Button>
      </section>
    </Shell>
  );
}
