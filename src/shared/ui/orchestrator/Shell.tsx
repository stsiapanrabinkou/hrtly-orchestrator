import { useState, type ReactNode } from "react";
import { Menu, Activity, UsersRound, ClipboardList, MessageSquare, ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HeaderControls } from "./HeaderControls";
import { workspaceNavigation, type WorkspaceItem } from "@/flows/_mocks/navigation";

type Props = {
  children: ReactNode;
  section?:
    | "monitoring"
    | "patient"
    | "recommendation"
    | "patients"
    | "recommendations"
    | "messages"
    | "outcomes";
  appBase?: string;
  items?: WorkspaceItem[];
};
export function Shell({
  children,
  section = "monitoring",
  appBase = "",
  items = workspaceNavigation,
}: Props) {
  const [pointerInteraction, setPointerInteraction] = useState(false);
  const active =
    section === "patient"
      ? "patients"
      : section === "recommendation"
        ? "recommendations"
        : section;
  return (
    <Tabs value={active} activationMode="manual" className="gap-0">
    <div className="min-h-svh bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-(--devbar-height) z-[80] -translate-y-full rounded-md bg-primary px-4 py-3 text-primary-foreground focus:translate-y-2"
      >
        Skip to main content
      </a>
      <header className="sticky top-(--devbar-height) z-20 border-b bg-card">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-4 sm:gap-6 sm:px-8">
          <a href={`${appBase}/monitoring/all`} aria-label="HRTLY Orchestrator home" className="flex shrink-0 items-baseline gap-1 rounded-sm">
            <span className="font-heading text-xl font-bold tracking-tight text-primary">HRTLY<span className="text-foreground">.</span></span>
            <span className="hidden text-xs font-medium text-muted-foreground lg:inline">Orchestrator</span>
          </a>
          <nav aria-label="Main navigation" className="hidden h-full min-w-0 flex-1 lg:block">
            <TabsList
              variant="line"
              aria-label="Workspace sections"
              className="h-full p-0 group-data-horizontal/tabs:h-full"
              onPointerDownCapture={() => setPointerInteraction(true)}
              onKeyDownCapture={() => setPointerInteraction(false)}
            >
              {items.map((item) => (
                <TabsTrigger key={item.id} value={item.id} asChild className={`h-full text-muted-foreground after:bg-navigation-active after:rounded-t-[3px] after:rounded-b-none group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-[3px] ${pointerInteraction ? "focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none" : ""}`}>
                  <a href={`${appBase}${item.href}`}><span className="inline-block translate-y-0.5">{item.label}</span></a>
                </TabsTrigger>
              ))}
            </TabsList>
          </nav>
          <div className="flex flex-1 justify-end lg:hidden">
            <Sheet>
              <SheetTrigger asChild><Button variant="ghost" size="icon" className="size-11" aria-label="Open navigation"><Menu className="size-5"/></Button></SheetTrigger>
              <SheetContent side="left" className="w-80 max-w-[calc(100vw-2rem)] overflow-y-auto px-5 py-7 data-[side=left]:top-(--devbar-height) data-[side=left]:h-[calc(100svh-var(--devbar-height))]">
                <SheetTitle>Orchestrator</SheetTitle>
                <SheetDescription>Clinical workspace</SheetDescription>
                <nav aria-label="Mobile navigation" className="mt-5 grid gap-2">
                  {items.map(item=>{
                    const Icon=item.id==='monitoring'?Activity:item.id==='patients'?UsersRound:item.id==='recommendations'?ClipboardList:item.id==='messages'?MessageSquare:ChartNoAxesCombined;
                    return <SheetClose key={item.id} asChild><Button asChild variant="ghost" className={`min-h-12 justify-start gap-3 rounded-lg border-0 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active===item.id?'bg-accent font-semibold text-primary hover:bg-accent':'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><a href={`${appBase}${item.href}`} aria-current={active===item.id?'page':undefined}><Icon className="size-4"/>{item.label}</a></Button></SheetClose>
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <HeaderControls />
        </div>
      </header>
      {items.map(item=>(
        <TabsContent key={item.id} value={item.id} className="m-0">
          {active===item.id?(
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-[1600px] px-4 py-7 outline-none sm:px-8 sm:py-8"
      >
        {children}
      </main>
          ):null}
        </TabsContent>
      ))}
      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 pb-6 text-[11px] text-muted-foreground sm:px-8">
        <span>Last updated Oct 19, 2026, 12:00 UTC</span>
        <span>Orchestrator / Clinician workspace</span>
      </footer>
    </div>
    </Tabs>
  );
}
