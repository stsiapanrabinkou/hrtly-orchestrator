// src/theme/ThemeProvider.tsx
//
// DESIGNER-OWNED (read-mostly). Mounted once by /app/router.tsx.
//
// Every previous pack in this series wrapped the app in the library's own
// provider — ConfigProvider, MuiThemeProvider, GlobalTheme. shadcn ships
// nothing of the kind, because there is no runtime theme object to provide:
// the theme is CSS custom properties that are already live the moment
// theme.css is imported.
//
// So this file does exactly one job — put or remove the `dark` class on
// <html> — and it is shipped rather than generated at init because "the agent
// writes a theme provider from a prose description" is the highest-variance
// step in the whole runbook, and it is the file everything else depends on.
//
// Deliberately NOT next-themes: that is one dependency and one hydration
// story for thirty lines of class toggling in a client-only Vite app.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "ui-theme";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Read the initial mode once, synchronously, before first paint.
 *
 * Doing this in a useEffect instead would render light, then flip to dark on
 * the next frame — a visible flash on every reload for anyone working in dark
 * mode, which is most of the time when you are reviewing a dark palette.
 *
 * Guarded for `document` because Storybook's docs pages and any SSR/prerender
 * step evaluate module scope without a DOM.
 */
function readInitialMode(): ThemeMode {
  if (typeof document === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage throws in some privacy modes. Not worth failing over.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  /** Storybook passes a fixed mode per story; the app leaves this undefined. */
  forcedMode,
}: {
  children: ReactNode;
  forcedMode?: ThemeMode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(readInitialMode);
  const active = forcedMode ?? mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", active === "dark");
    // `color-scheme` makes native controls, scrollbars and form widgets follow
    // the theme. Without it a dark app keeps white scrollbars.
    root.style.colorScheme = active;
  }, [active]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal; the mode still applies for this session.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: active,
      setMode,
      toggle: () => setMode(active === "dark" ? "light" : "dark"),
    }),
    [active, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Returns a working no-op outside the provider rather than throwing.
 *
 * The DevBar calls this, and the DevBar is also rendered by the Flow Map story
 * where there is no provider in the tree. Throwing would turn a missing
 * decorator into a crashed story with a stack trace, which is a bad first
 * five minutes for a designer.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return (
    ctx ?? {
      mode: "light",
      setMode: () => {},
      toggle: () => {},
    }
  );
}
