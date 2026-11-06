import type { ReactNode } from "react";
import { Heading, Text } from "@/shared/ui/typography";

export function Panel({
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
export function Empty({ children }: { children: ReactNode }) {
  return (
    <Text variant="muted" className="rounded-lg border border-dashed p-5">
      {children}
    </Text>
  );
}
export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

