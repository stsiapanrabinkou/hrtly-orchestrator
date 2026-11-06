import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

const Navigation = createContext<((href: string) => void) | undefined>(undefined);

/** Carries temporary design-preview snapshots through ordinary workspace links. */
export function FlowNavigation({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  return <Navigation.Provider value={(href) => {
    const url = new URL(href, window.location.href);
    const section = url.pathname.split("/")[1];
    const currentSection = location.pathname.split("/")[1];
    void navigate({ to: url.pathname, hash: url.hash.slice(1), state: { ...location.state, workspaceFilters: section !== currentSection ? undefined : location.state.workspaceFilters } });
  }}>{children}</Navigation.Provider>;
}

export function PreviewLink({ onClick, href, ...props }: ComponentProps<"a">) {
  const navigate = useContext(Navigation);
  return <a {...props} href={href} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented && navigate && href && !props.target && !props.download && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && new URL(href, window.location.href).origin === window.location.origin) {
      event.preventDefault(); navigate(href);
    }
  }} />;
}
