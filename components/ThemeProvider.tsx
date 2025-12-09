"use client";

import { useEffect } from "react";
import { theme } from "@/lib/theme";
import { fonts, getFontFamily } from "@/lib/fonts";

/**
 * ThemeProvider Component
 * 
 * This component injects CSS variables from theme.ts and fonts.ts into the document root.
 * This makes theme.ts the single source of truth for all colors and fonts.ts for all fonts.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Get the root element
    const root = document.documentElement;

    // Inject all theme colors as CSS variables
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--foreground", theme.foreground);
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-foreground", theme.primaryForeground);
    root.style.setProperty("--primary-hover", theme.primaryHover);
    root.style.setProperty("--primary-light", theme.primaryLight);
    root.style.setProperty("--secondary", theme.secondary);
    root.style.setProperty("--secondary-foreground", theme.secondaryForeground);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.accentForeground);
    root.style.setProperty("--accent-light", theme.accentLight);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--muted-foreground", theme.mutedForeground);
    root.style.setProperty("--border", theme.border);
    root.style.setProperty("--input", theme.input);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--card-foreground", theme.cardForeground);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--success-background", theme.successBackground);
    root.style.setProperty("--error", theme.error);
    root.style.setProperty("--error-background", theme.errorBackground);
    root.style.setProperty("--warning", theme.warning);
    root.style.setProperty("--warning-background", theme.warningBackground);
    root.style.setProperty("--info", theme.info);
    root.style.setProperty("--info-background", theme.infoBackground);
    root.style.setProperty("--calendar-today", theme.calendar.today);
    root.style.setProperty("--calendar-present", theme.calendar.present);
    root.style.setProperty("--calendar-absent", theme.calendar.absent);
    root.style.setProperty("--calendar-leave", theme.calendar.leave);
    root.style.setProperty("--calendar-holiday", theme.calendar.holiday);
    root.style.setProperty("--calendar-on-duty", theme.calendar.onDuty);
    
    // Inject header and sidebar colors
    root.style.setProperty("--header-background", theme.header.background);
    root.style.setProperty("--header-foreground", theme.header.foreground);
    root.style.setProperty("--header-search-background", theme.header.searchBackground);
    root.style.setProperty("--header-search-foreground", theme.header.searchForeground);
    root.style.setProperty("--sidebar-background", theme.sidebar.background);
    root.style.setProperty("--sidebar-foreground", theme.sidebar.foreground);
    root.style.setProperty("--sidebar-active-background", theme.sidebar.activeBackground);
    root.style.setProperty("--sidebar-active-foreground", theme.sidebar.activeForeground);
    root.style.setProperty("--sidebar-hover-background", theme.sidebar.hoverBackground);
    root.style.setProperty("--sidebar-border", theme.sidebar.border);

    // Inject all font settings as CSS variables
    root.style.setProperty("--font-primary", fonts.primary);
    root.style.setProperty("--font-fallback", fonts.fallback);
    root.style.setProperty("--font-mono", fonts.mono);
    root.style.setProperty("--font-family", getFontFamily("primary"));
    root.style.setProperty("--font-family-mono", getFontFamily("mono"));
  }, []);

  return <>{children}</>;
}

