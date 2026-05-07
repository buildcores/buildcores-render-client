import { useEffect, useState, type CSSProperties } from "react";
import { RenderInteractiveConfigTheme } from "../types";

export type ResolvedInteractiveConfigTheme = "light" | "dark";

const darkModeQuery = "(prefers-color-scheme: dark)";

function getSystemTheme(): ResolvedInteractiveConfigTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia(darkModeQuery).matches ? "dark" : "light";
}

export function useResolvedInteractiveConfigTheme(
  theme: RenderInteractiveConfigTheme = "system"
): ResolvedInteractiveConfigTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedInteractiveConfigTheme>(() => getSystemTheme());

  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(darkModeQuery);
    const handleChange = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");

    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);

    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }, [theme]);

  return theme === "system" ? systemTheme : theme;
}

export function getInteractiveConfigThemeVariables(
  theme: ResolvedInteractiveConfigTheme
): CSSProperties {
  const isDark = theme === "dark";

  return {
    "--bcrc-surface": isDark ? "#0d0e10" : "#ffffff",
    "--bcrc-surface-muted": isDark ? "#17181b" : "#f4f6f8",
    "--bcrc-surface-raised": isDark ? "#111215" : "#fbfcfd",
    "--bcrc-input": isDark ? "#101114" : "#ffffff",
    "--bcrc-border": isDark ? "#26282d" : "#d7dde5",
    "--bcrc-border-soft": isDark ? "#24262a" : "#e1e6ed",
    "--bcrc-border-strong": isDark ? "#363940" : "#c4ccd7",
    "--bcrc-text": isDark ? "#f3f4f6" : "#18202a",
    "--bcrc-text-muted": isDark ? "#9ca3af" : "#6a7380",
    "--bcrc-section-title": isDark ? "#a1a1aa" : "#596579",
    "--bcrc-icon-bg": isDark ? "#1a1b1f" : "#eef3f8",
    "--bcrc-icon-text": isDark ? "#d1d5db" : "#46576d",
    "--bcrc-primary": isDark ? "#7f2d25" : "#27364a",
    "--bcrc-primary-border": isDark ? "#93352c" : "#27364a",
    "--bcrc-primary-text": "#ffffff",
    "--bcrc-secondary-text": isDark ? "#e5e7eb" : "#27364a",
    "--bcrc-chip-bg": isDark ? "#18191d" : "#ffffff",
    "--bcrc-accent-bg": isDark ? "#102235" : "#eff6ff",
    "--bcrc-accent-border": isDark ? "#183a5a" : "#bfdbfe",
    "--bcrc-accent-text": isDark ? "#60a5fa" : "#1d4ed8",
    "--bcrc-success-bg": isDark ? "#15351c" : "#f0fdf4",
    "--bcrc-success-border": isDark ? "#245b30" : "#bbf7d0",
    "--bcrc-success-text": isDark ? "#7ddf8a" : "#166534",
    "--bcrc-warning-bg": isDark ? "#3a2814" : "#fff7ed",
    "--bcrc-warning-border": isDark ? "#725024" : "#fed7aa",
    "--bcrc-warning-text": isDark ? "#f6c177" : "#9a3412",
    "--bcrc-danger-bg": isDark ? "#3a1111" : "#fef2f2",
    "--bcrc-danger-border": isDark ? "#6f2020" : "#fecaca",
    "--bcrc-danger-text": isDark ? "#f87171" : "#b91c1c",
    "--bcrc-switch-off": isDark ? "#484b52" : "#c9d1dc",
    "--bcrc-airflow-intake-bg": isDark ? "#0f2435" : "#eff6ff",
    "--bcrc-airflow-intake-text": isDark ? "#55a9ff" : "#1d4ed8",
    "--bcrc-airflow-exhaust-bg": isDark ? "#331717" : "#fef2f2",
    "--bcrc-airflow-exhaust-text": isDark ? "#f87171" : "#b91c1c",
    "--bcrc-popover-shadow": isDark ? "0 12px 32px rgba(0, 0, 0, 0.56)" : "0 12px 32px rgba(24, 32, 42, 0.16)",
    "--bcrc-panel-shadow": isDark ? "0 20px 64px rgba(0, 0, 0, 0.72)" : "0 18px 56px rgba(0, 0, 0, 0.28)",
  } as CSSProperties;
}
